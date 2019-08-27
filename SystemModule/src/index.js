import React, { Fragment, PureComponent } from 'react';
import { Card, Row, Col, Icon, Input, Menu, Dropdown, Divider, Button, message, Popconfirm, Switch } from 'antd';
import { NscTree, NscGrid, NscIcon, BodyRow } from 'nsc-framework-react';
import { request } from 'nsc-framework-react/lib/utils';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import ModuleEdit from './ModuleEdit'
import ModuleAuth from './ModuleAuth'
import styles from './index.less';
import 'antd/dist/antd.css';
const { Search } = Input;
const { BodyRowComponent, DragDropContext, HTML5Backend } = BodyRow;


class ModulePage extends PureComponent {
  state = {
    selectedRowKeys: []
  }

  //是否有效开关
  handleModuleSwitchChange = (value, record) => {
    let _this = this;
    let url = '/api/admin/modules';
    let isValid = value == false ? 0 : 1;
    request(url, {
      method: 'PATCH', data: { "isValid": isValid, "id": record.id }, callback: function (data) {
        record.isValid = isValid;
        _this.refs.moduleGrid.forceUpdate();
      }
    });
  }

  //公用弹出框
  openModal = (params, type, callback) => {
    this.refs.moduleEidt.show({
      params: params,
      type: type,
      callback: callback
    });
  }
  /**
   * 添加模块数据
   * @param {*} params 
   */
  handleAddModule(params) {
    const _this = this, { moduleEidt } = this.refs;
    moduleEidt.show({
      params: params,
      type: 'add',
      callback: function (result) {
        if (!result) return;
        _this.reload(result.type, function () {
          message.success("添加成功！");
        });
      }
    });
  }

  //修改模块
  handleEditModule(params) {
    if (!params.id) {
      console.error("修改主键不能为空，非法操作！");
      return;
    }
    const _this = this, { moduleEidt } = this.refs;
    moduleEidt.show({
      params: params,
      type: 'edit',
      callback: function (result) {
        if (!result) return;
        _this.reload(result.type, function () {
          message.success("修改成功！");
        });
      }
    });
  }

  /**
   * 
   * @param {*} id 要删除的模块ID
   * @param {*} type  00=目录  01=模块
   */
  handleRemoveModule(id, type, callback) {
    if (!id) {
      console.error("删除主键不能为空，非法操作！");
      return;
    }
    const _this = this;
    request("/api/admin/modules/" + id, {
      method: "DELETE", callback: function (data) {
        _this.reload(type, callback);
      }
    });
  }

  /**
   * 批量删除模块
   * @param {*} ids  模块ids
   * @param {*} type  00=目录 01=模块
   * @param {*} callback  完成回调
   */
  handleBatchRemoveModule(ids, type, callback) {
    if (!ids || ids.length == 0) {
      console.error("删除主键不能为空，非法操作！");
      return;
    }
    const _this = this;
    request("/api/admin/modules", {
      method: "DELETE", data: { ids: ids }, callback: function (data) {
        _this.reload(type, callback);
      }
    });
  }

  /**
   * 刷新数据 
   * @param {*} type  00=目录 01=模块
   * @param {*} callback 
   */
  reload(type, callback) {
    const { moduleTree, moduleGrid } = this.refs;
    if (type == '00') { //目录
      moduleTree.store.reload({ callback: callback });
      this.selectedTreeNodeId = null;
    } else {//模块
      moduleGrid.store.reload({ callback: callback });
    }
  }

  /**
   * 模块树操作
   */
  handleMenuItemClick = e => {
    const key = e.key;
    switch (e.key) {
      case 'add': {
        this.handleAddModule({
          parentId: this.selectedTreeNodeId || -1,
          type: '00'
        });
        break;
      }
      case 'edit': {
        if (!this.selectedTreeNodeId) { message.warn("请选择要修改的目录！"); return; }
        this.handleEditModule({
          id: this.selectedTreeNodeId,
          type: '00'
        });
        break;
      }
    }
  }

  //模块树移动排序
  onDrop = (e) => {
    let _this = this,
      newNode = [],
      ids = [],
      dragNode = e.dragNode.props.dataref,
      node = e.node.props.dataref,
      dropPosition = e.dropPosition;
    dragNode.remove();
    if (e.dropToGap) {
      newNode = node.parentNode.appendChild(dragNode.attribute, dropPosition + 1);
      ids = node.parentNode.getChildNodeIds();
    } else {
      newNode = node.appendChild(dragNode.attribute);
      ids = node.getChildNodeIds();
    }
    let params = { id: newNode.id, parentId: newNode.parentId, ids: ids }
    request("/api/admin/modules/drag", {
      method: 'PATCH', data: params, callback: function (data) {
        _this.refs.moduleTree.reload();
      }
    });
  }

  /**
   * 模块列表移动排序
   */
  moveRow = (dragIndex, hoverIndex, drag, target) => {
    var _this = this, moduleGrid = this.refs.moduleGrid;
    let dragNode = drag.record;
    let targetNode = target.record;
    dragNode.moveArray(dragNode, targetNode);
    let ids = dragNode.parentNode.getChildNodeIds();
    let params = { id: dragNode.id, parentId: dragNode.attribute.parentId, ids: ids }
    request("/api/admin/modules/drag", {
      method: 'PATCH', data: params, callback: function (data) {
        moduleGrid.store.reload();
      }
    });
  };

  /**
   * 模块树点击
   */
  handleMenuClick = (selectedKeys, e) => {
    const id = selectedKeys.length > 0 ? selectedKeys[0] : null;
    this.refs.moduleGrid.store.reload({ params: { current: 1, parentid: id } });
    this.selectedTreeNodeId = id;
  }
  /**
   * 菜单搜索
   */
  handleMenuSearch = (e, ref) => {
    this.refs.moduleTree.handleSearch(e.target.value);
  }

  /**
   * grid选择改变
   */
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }

  //模块列表columns
  columns = [{
    title: '模块名称',
    dataIndex: 'name',
    width: 150,
    sorter: true
  }, {
    title: '目录名称',
    dataIndex: 'parentName',
    width: 150,
    sorter: true,
  }, {
    title: '模块类型',
    dataIndex: 'typeName',
    width: 150,
    sorter: true
  }, {
    title: '菜单路径',
    dataIndex: 'url',
    flex: 1,
  }, {
    title: '是否有效',
    dataIndex: 'isValid',
    align: 'center',
    width: 100,
    render: (text, record) => (
      <Fragment>
        <Switch checkedChildren="开" unCheckedChildren="关" checked={text == 1} onChange={(value) => this.handleModuleSwitchChange(value, record)} />
      </Fragment>
    ),
  }, {
    title: '操作',
    align: 'center',
    width: 180,
    render: (text, record) => (
      <Fragment>
        <a onClick={e => {
          e.preventDefault();
          this.refs.moduleAuth.show({
            params: {
              id: record.id,
              name: record.name
            }
          });
        }} >权限</a>
        <Divider type="vertical" />
        <a onClick={e => {
          e.preventDefault();
          this.handleEditModule({
            id: record.id,
            type: '01'
          });
        }} >编辑</a>
        <Divider type="vertical" />
        <Popconfirm title="你确定删除吗?" onConfirm={e => {
          e.preventDefault();
          this.handleRemoveModule(record.id, '01', function () {
            message.success("删除成功！");
          });
        }}>
          <a href="#">删除</a>
        </Popconfirm>
      </Fragment>
    )
  }];

  //模块树的菜单Menu
  moduleTreeMenu = (
    <Menu onClick={this.handleMenuItemClick}>
      <Menu.Item key="add"><Icon type="folder-add" theme="twoTone" twoToneColor="#1890ff" />添加目录</Menu.Item>
      <Menu.Item key="edit"><Icon type="edit" theme="twoTone" twoToneColor="green" />编辑目录</Menu.Item>
      <Menu.Item key="remove">
        <Popconfirm title="你确定删除吗?" onConfirm={e => {
          if (!this.selectedTreeNodeId) { message.warn("请选择要删除的目录！"); return; }
          this.handleRemoveModule(this.selectedTreeNodeId, '00');
        }}>
          <Icon type="delete" theme="twoTone" twoToneColor="red" />&nbsp;&nbsp;删除目录
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  render() {
    const _this = this;
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <PageHeaderWrapper title={false}>
        <GridContent>
          <Row gutter={10}>
            <Col xxl={5} xl={6} lg={7} md={9} >
              <Card bordered={false}>
                <Input
                  addonAfter={
                    <div>
                      <Dropdown overlay={this.moduleTreeMenu} trigger={['click']}>
                        <Icon type="plus" className={styles.icon} />
                      </Dropdown>
                      <Divider type="vertical" />
                      <NscIcon type="sync" ref="treeRefreshIcon" onClick={() => {
                        const { treeRefreshIcon, moduleTree } = _this.refs;
                        treeRefreshIcon.setLoading(true);
                        moduleTree.store.reload({
                          callback: function () {
                            treeRefreshIcon.setLoading(false);
                          }
                        });
                      }} />
                    </div>
                  }
                  placeholder="搜索目录"
                  onPressEnter={this.handleMenuSearch}
                />
                <NscTree
                  ref="moduleTree"
                  draggable={true}
                  onSelect={(selectedKeys, e) => this.handleMenuClick(selectedKeys, e)}
                  onDrop={this.onDrop}
                  store={{
                    autoLoad: true,
                    url: '/api/admin/modules/tree'
                  }}
                ></NscTree>
              </Card>
            </Col>
            <Col xxl={19} xl={18} lg={17} md={15}>
              <Card bordered={false}>
                <div className={styles.tableListOperator}>
                  <Row gutter={10}>
                    <Col xs={24} sm={17}>
                      <Button icon="plus" type="primary" onClick={() => {
                        this.handleAddModule({
                          parentId: this.selectedTreeNodeId,
                          type: '01'
                        });
                      }}>
                        新建
                    </Button>
                      <Button icon="sync" ref="syncBtn" onClick={(e) => {
                        const syncBtn = _this.refs.syncBtn;
                        syncBtn.setState({ loading: true });
                        this.refs.moduleGrid.store.reload({
                          callback: function () {
                            syncBtn.setState({ loading: false });
                          }
                        });
                      }}>刷新</Button>
                      <Dropdown overlay={
                        <Menu>
                          <Menu.Item key="export1"><Icon type="file-excel" theme="twoTone" twoToneColor="#1890ff" />导出选中</Menu.Item>
                          <Menu.Item key="export2"><Icon type="file-excel" theme="twoTone" twoToneColor="#1890ff" />导出当前页</Menu.Item>
                          <Menu.Item key="export3"><Icon type="file-excel" theme="twoTone" twoToneColor="green" />导出全部</Menu.Item>
                        </Menu>
                      }>
                        <Button icon="download">
                          导出 <Icon type="down" />
                        </Button>
                      </Dropdown>
                      {selectedRowKeys.length > 0 && (
                        <span>
                          <Popconfirm title="你确定删除全部选中的模块吗？" onConfirm={e => {
                            this.handleBatchRemoveModule(selectedRowKeys, '01', function () {
                              _this.setState({ selectedRowKeys: [] });
                              message.success("删除成功！");
                            });
                          }}>
                            <Button type="danger" ghost>批量删除</Button>
                          </Popconfirm>
                        </span>
                      )}
                    </Col>
                    <Col xs={24} sm={7}>
                      <Search className={styles.extraContentSearch} style={{
                        width: "auto",
                        float: "right"
                      }} placeholder="模块名称" onSearch={(value) => {
                        _this.refs.moduleGrid.store.reload({
                          params: { name: value }
                        });
                      }} />
                    </Col>
                  </Row>
                </div>
                <NscGrid
                  ref="moduleGrid"
                  columns={this.columns}
                  store={{
                    autoLoad: true,
                    url: '/api/admin/modules'
                  }}
                  rowSelection={rowSelection}
                  components={BodyRowComponent}
                  onRow={(record, index) => ({
                    index, record,
                    moveRow: this.moveRow,
                  })}
                />
              </Card>
            </Col>
          </Row>
        </GridContent>
        <ModuleEdit ref="moduleEidt" />
        <ModuleAuth ref="moduleAuth" />
      </PageHeaderWrapper >
    );
  }
}

export default new DragDropContext(HTML5Backend)(ModulePage);