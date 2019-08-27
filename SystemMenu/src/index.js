import React, { Fragment, PureComponent } from 'react';
import { Card, Row, Col, Icon, Input, Menu, Dropdown, Divider, Button, message, Popconfirm, Switch } from 'antd';
import { NscTree, NscGrid, NscIcon, BodyRow } from 'nsc-framework-react-components';
import { request, utils } from 'nsc-framework-react-components/lib/utils';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import MenuEdit from './MenuEdit'
const { Search } = Input;
const { BodyRowComponent, DragDropContext, HTML5Backend } = BodyRow;
import styles from './index.less';

class MenuPage extends PureComponent {
  state = {
    selectedRowKeys: []
  }

  //是否有效开关
  handleMenuSwitchChange = (value, record) => {
    let _this = this;
    let url = '/api/admin/menus';
    let isValid = value == false ? 0 : 1;
    request(url, {
      method: 'PATCH',
      data: { "isValid": isValid, "id": record.id },
      callback: function (data) {
        record.isValid = isValid;
        _this.refs.menuGrid.forceUpdate();
      }
    })
  }

  //公用弹出框
  openModal = (params, type, callback) => {
    this.refs.menuEidt.show({
      params: params,
      type: type,
      callback: callback
    });
  }
  /**
   * 添加菜单数据
   * @param {*} params 
   */
  handleAddMenu(params) {
    const _this = this, { menuEidt } = this.refs;
    menuEidt.show({
      params: params,
      type: 'add',
      callback: function (result) {
        if (!result) return;
        _this.reload(result.type);
      }
    });
  }

  //修改菜单
  handleEditMenu(params) {
    if (!params.id) {
      console.error("修改主键不能为空，非法操作！");
      return;
    }
    const _this = this, { menuEidt } = this.refs;
    menuEidt.show({
      params: params,
      type: 'edit',
      callback: function (result) {
        if (!result) return;
        _this.reload(result.type);
      }
    });
  }

  /**
   * 
   * @param {*} id 要删除的菜单ID
   * @param {*} type  00=目录  01=菜单
   */
  handleRemoveMenu(id, type, callback) {
    if (!id) {
      console.error("删除主键不能为空，非法操作！");
      return;
    }
    const _this = this;
    request("/api/admin/menus/" + id, {
      method: "DELETE",
      callback: function (data) {
        _this.reload(type, callback);
      }
    });
  }
  /**
   * 批量删除菜单
   * @param {*} ids  菜单ids
   * @param {*} type  00=目录 01=菜单
   * @param {*} callback  完成回调
   */
  handleBatchRemoveMenu(ids, type, callback) {
    if (!ids || ids.length == 0) {
      console.error("删除主键不能为空，非法操作！");
      return;
    }
    const _this = this;
    request("/api/admin/menus", {
      method: "DELETE",
      data: { ids: ids },
      callback: function (data) {
        _this.reload(type, callback);
      }
    });
  }

  /**
   * 刷新数据 
   * @param {*} type  00=目录 01=菜单
   * @param {*} callback 
   */
  reload(type, callback) {
    const { menuTree, menuGrid } = this.refs;
    if (type == '00') { //目录
      menuTree.store.reload({ callback: callback });
    } else {//菜单
      menuGrid.store.reload({ callback: callback });
    }
  }

  /**
   * 菜单树操作
   */
  handleMenuItemClick = e => {
    const key = e.key;
    switch (e.key) {
      case 'add': {
        this.handleAddMenu({
          parentId: this.selectedTreeNodeId || -1,
          type: '00'
        });
        break;
      }
      case 'edit': {
        if (!this.selectedTreeNodeId) { message.warn("请选择要修改的目录！"); return; }
        this.handleEditMenu({
          id: this.selectedTreeNodeId,
          type: '00'
        });
        break;
      }
    }
  }

  //菜单树移动
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
    request("/api/admin/menus/drag", {
      method: 'PATCH', data: params, callback: function (data) {
        _this.refs.menuTree.reload();
      }
    });
  }


  /**
   * 模块列表移动排序
   */
  moveRow = (dragIndex, hoverIndex, drag, target) => {
    var _this = this, menuGrid = this.refs.menuGrid;
    let dragNode = drag.record;
    let targetNode = target.record;
    dragNode.moveArray(dragNode, targetNode);
    let ids = dragNode.parentNode.getChildNodeIds();
    let params = { id: dragNode.id, parentId: dragNode.attribute.parentId, ids: ids }
    request("/api/admin/menus/drag", {
      method: 'PATCH', data: params, callback: function (data) {
        menuGrid.store.reload();
      }
    });
  };

  /**
   * 菜单树点击
   */
  handleMenuClick = (selectedKeys, e) => {
    const id = selectedKeys.length > 0 ? selectedKeys[0] : null;
    this.refs.menuGrid.store.reload({ params: { current: 1, parentid: id } });
    this.selectedTreeNodeId = id;
  }
  /**
   * 菜单搜索
   */
  handleMenuSearch = (e, ref) => {
    this.refs.menuTree.handleSearch(e.target.value);
  }

  /**
   * grid选择改变
   */
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }

  //菜单列表columns
  columns = [{
    title: '菜单名称',
    dataIndex: 'name',
    width: 150,
    sorter: true
  }, {
    title: '目录名称',
    dataIndex: 'parentName',
    width: 150,
    sorter: true,
  }, {
    title: '关联模块',
    dataIndex: 'moduleName',
    minWidth: 150,
    flex: 1,
  }, {
    title: '菜单类型',
    dataIndex: 'typeName',
    align: 'center',
    width: 120,
    field: 'type',
    sorter: true
  }, {
    title: '菜单图标',
    dataIndex: 'icon',
    minWidth: 150,
    flex: 1,
    render: (text, record) => (
      <div>
        {
          utils.getIcon(text)
        }
        {
          text
        }
      </div>
    ),
  }, {
    title: '图标Cls',
    dataIndex: 'iconCls',
    flex: 1,
  },  {
    title: '备注',
    dataIndex: 'description',
    flex: 1,
  },{
    title: '是否有效',
    dataIndex: 'isValid',
    align: 'center',
    width: 100,
    render: (text, record) => (
      <Fragment>
        <Switch checkedChildren="开" unCheckedChildren="关" checked={text == 1} onChange={(value) => this.handleMenuSwitchChange(value, record)} />
      </Fragment>
    ),
  }, {
    title: '操作',
    align: 'center',
    width: 150,
    render: (text, record) => (
      <Fragment>
        <a onClick={e => {
          e.preventDefault();
          this.handleEditMenu({
            id: record.id,
            type: '01'
          });
        }} >编辑</a>
        <Divider type="vertical" />
        <Popconfirm title="你确定删除吗?" onConfirm={e => {
          e.preventDefault();
          this.handleRemoveMenu(record.id, '01');
        }}>
          <a href="#">删除</a>
        </Popconfirm>
      </Fragment>
    )
  }];

  //菜单树的菜单Menu
  menuTreeMenu = (
    <Menu onClick={this.handleMenuItemClick}>
      <Menu.Item key="add"><Icon type="folder-add" theme="twoTone" twoToneColor="#1890ff" />添加目录</Menu.Item>
      <Menu.Item key="edit"><Icon type="edit" theme="twoTone" twoToneColor="green" />编辑目录</Menu.Item>
      <Menu.Item key="remove">
        <Popconfirm title="你确定删除吗?" onConfirm={e => {
          if (!this.selectedTreeNodeId) { message.warn("请选择要删除的目录！"); return; }
          this.handleRemoveMenu(this.selectedTreeNodeId, '00');
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
                      <Dropdown overlay={this.menuTreeMenu} trigger={['click']}>
                        <Icon type="plus" />
                      </Dropdown>
                      <Divider type="vertical" />
                      <NscIcon type="sync" ref="treeRefreshIcon" onClick={() => {
                        const { treeRefreshIcon, menuTree } = _this.refs;
                        treeRefreshIcon.setLoading(true);
                        menuTree.store.reload({
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
                  ref="menuTree"
                  draggable={true}
                  onSelect={this.handleMenuClick}
                  onDrop={this.onDrop}
                  store={{
                    autoLoad: true,
                    url: '/api/admin/menus/tree'
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
                        this.handleAddMenu({
                          parentId: this.selectedTreeNodeId,
                          type: '01'
                        });
                      }}>
                        新建
                    </Button>
                      <Button icon="sync" ref="syncBtn" onClick={(e) => {
                        const syncBtn = _this.refs.syncBtn;
                        syncBtn.setState({ loading: true });
                        this.refs.menuGrid.store.reload({
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
                          <Popconfirm title="你确定删除全部选中的菜单吗？" onConfirm={e => {
                            this.handleBatchRemoveMenu(selectedRowKeys, '01', function () {
                              _this.setState({ selectedRowKeys: [] });
                            });
                          }}>
                            <Button type="danger" ghost>批量删除</Button>
                          </Popconfirm>
                        </span>
                      )}
                    </Col>
                    <Col xs={24} sm={7}>
                      <Search style={{
                        width: "auto",
                        float: "right"
                      }} placeholder="菜单名称" onSearch={(value) => {
                        _this.refs.menuGrid.store.reload({
                          params: { name: value }
                        });
                      }} />
                    </Col>
                  </Row>
                </div>
                <NscGrid
                  ref="menuGrid"
                  columns={this.columns}
                  store={{
                    autoLoad: true,
                    url: '/api/admin/menus'
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
        <MenuEdit ref="menuEidt" />
      </PageHeaderWrapper >
    );
  }
}

export default new DragDropContext(HTML5Backend)(MenuPage);