import React, { Component, Fragment } from 'react';
import { Card, Row, Col, Divider, Popconfirm,Input, Button, Switch } from 'antd';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { NscGrid } from 'nsc-framework-react-components';
import { request } from 'nsc-framework-react-components/lib/utils';
import DictItemEdit from './DictItemEdit';
import DictEdit from './DictEdit';
import { connect } from 'dva';
const { Search } = Input;
import styles from './index.less';

class DictPage extends Component {
  state = {
    selectedKeysDict: [],
    selectedKeysDictItem: []
  }
  onClickRow = (event, record) => {
    console.log(record);
    let id = record.id;
    this.setState({ selectedKeysDict: [id] });
    this.refs.dictItemGrid.store.load({ url: '/api/admin/dicts/' + id + '/items' });
  }
  //新建，编辑弹框
  handleDictModal = (params, type) => {
    let _this = this;
    this.refs.dictEdit.show({
      params: params,
      type: type,
      callback: function (result) {
        _this.refs.dictGrid.store.reload();
      }
    });
  }
  handleDictSwitchChange = (value, record) => {
    let _this = this;
    let url = '/api/admin/dicts';
    let isValid = value == false ? 0 : 1;
    request(url, {
      method: 'PATCH',
      data: { "isValid": isValid, "id": record.id },
      callback: function (data) {
        record.isValid = isValid;
        _this.refs.dictGrid.forceUpdate();
      }
    })
  }
  //删除
  handleDictDelete = (id) => {
    let _this = this;
    let url = '/api/admin/dicts/' + id;
    request(url, {
      method: 'DELETE',
      callback: function (data) {
        _this.refs.dictGrid.store.reload();
      }
    })
  }
  //搜索
  handleDictSearch = (text) => {
    this.refs.dictGrid.store.reload({
      params: {
        code: text//加条件
      }
    });
    this.refs.dictItemGrid.store.removeAll();
    this.refs.dictItemSearch.input.setValue("")
  }

  //dictItemGrid选择改变
  onSelectChangeDictItem = (selectedRowKeys) => {
    this.setState({ selectedKeysDictItem: selectedRowKeys });
  }

  //新建，编辑弹框
  handleDictItemModal = (params, type) => {
    let _this = this;
    this.refs.dictItemEdit.show({
      params: params,
      type: type,
      callback: function (result) {
        _this.refs.dictItemGrid.store.reload();
      }
    });
  }
  handleDictItemSwitchChange = (value, record) => {
    let _this = this;
    let url = '/api/admin/dicts/items/';
    let isValid = value == false ? 0 : 1;
    request(url, {
      method: 'PATCH',
      data: { "isValid": isValid, "id": record.id },
      callback: function (data) {
        record.isValid = isValid;
        _this.refs.dictItemGrid.forceUpdate();
      }
    });
  }
  //删除
  handleDictItemDelete = (ids) => {
    debugger
    let _this = this;
    let url = '/api/admin/dicts/items';
    request(url, {
      method: 'DELETE',
      data: { "ids": ids },
      callback: function (data) {
        _this.refs.dictItemGrid.store.reload();
      }
    });
  }

  //搜索
  handleDictItemSearch = (text) => {
    this.refs.dictItemGrid.store.reload({
      params: {
        code: text//加条件
      }
    })
  }

  render() {
    const columnsDict = [
      {
        title: '视图名称',
        dataIndex: 'viewName',
        sorter: true,
        width: 100
      }, {
        title: '描述',
        dataIndex: 'remark',
        sorter: true,
        flex: 1
      }, {
        title: '类型',
        dataIndex: 'typeName',
        width: 80
      }, {
        title: '是否有效',
        dataIndex: 'isValid',
        width: 100,
        align: 'center',
        render: (text, record) => (
          <Fragment>
            <Switch checkedChildren="开" unCheckedChildren="关" checked={text == 1} onChange={(value) => this.handleDictSwitchChange(value, record)} />
          </Fragment>
        ),
      }, {
        title: '操作',
        align: 'center',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.handleDictModal({ id: record.id }, 'edit')} >编辑</a>
            <Divider type="vertical" />
            <Popconfirm title="你确定删除吗?" onConfirm={e => {
              e.preventDefault();
              this.handleDictDelete(record.id)
            }}>
              <a href="#">删除</a>
            </Popconfirm>
          </Fragment>
        ),
        width: 120
      }];

    const columnsDictItem = [
      {
        title: '编码',
        dataIndex: 'code',
        flex: 1,
      }, {
        title: '名称',
        dataIndex: 'name',
        flex: 1,
        // sorter: true
      }, {
        title: '组名',
        dataIndex: 'groupName',
        flex: 1,
        // sorter: true,
      }, {
        title: '排序',
        dataIndex: 'sort',
        flex: 1,
        // sorter: true,
      }, {
        title: '是否有效',
        dataIndex: 'isValid',
        align: 'center',
        width: 90,
        render: (text, record) => (
          <Fragment>
            <Switch checkedChildren="开" unCheckedChildren="关" checked={text == 1} onChange={(value) => this.handleDictItemSwitchChange(value, record)} />
          </Fragment>
        )
      }, {
        title: '操作',
        align: 'center',
        width: 110,
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.handleDictItemModal({ id: record.id }, 'edit')} >编辑</a>
            <Divider type="vertical" />
            <Popconfirm title="你确定删除吗?" onConfirm={e => {
              e.preventDefault();
              this.handleDictItemDelete([record.id])
            }}>
              <a href="#">删除</a>
            </Popconfirm>
          </Fragment>
        ),
      }];


    const { selectedKeysDictItem, selectedKeysDict } = this.state;
    const rowSelectionDictItem = {
      selectedRowKeys: selectedKeysDictItem,
      onChange: this.onSelectChangeDictItem
    };
    return (
      <PageHeaderWrapper title={false}>
        <GridContent>
          <Row gutter={10}>
            <Col xxl={12} xl={12} lg={12} md={12}>
              <Card bordered={false}>
                <div className={styles.tableListOperator}>
                  <Row gutter={10}>
                    <Col xs={24} sm={17}>
                      <Button icon="plus" type="primary" onClick={() => this.handleDictModal({}, 'add')}>新建</Button>
                      <Button icon="sync" ref="syncBtn" onClick={(e) => {
                        const _this = this;
                        const syncBtn = _this.refs.syncBtn;
                        syncBtn.setState({ loading: true });
                        this.refs.dictGrid.store.reload({
                          callback: function () {
                            syncBtn.setState({ loading: false });
                            _this.refs.dictItemGrid.store.removeAll();
                            _this.refs.dictItemSearch.input.setValue("");
                          }
                        });
                      }}>刷新</Button>
                    </Col>
                    <Col xs={24} sm={7}>
                      <Search ref='dictSearch'
                        style={{
                          width: "auto",
                          float: "right"
                        }} placeholder="视图名称/描述" onSearch={(text) => this.handleDictSearch(text)} />
                    </Col>
                  </Row>
                </div>
                <NscGrid
                  ref="dictGrid"
                  columns={columnsDict}
                  pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true
                  }}
                  store={{
                    autoLoad: true,
                    url: '/api/admin/dicts'
                  }}
                  clickChangeColor={true}
                  onRow={record => {
                    return {
                      onClick: event => this.onClickRow(event, record)
                    }
                  }}
                />
              </Card>
            </Col>

            <Col xxl={12} xl={12} lg={12} md={12}>
              <Card bordered={false}>
                <div className={styles.tableListOperator}>
                  <Row gutter={10}>
                    <Col xs={24} sm={17}>
                      {selectedKeysDict.length > 0 && (
                        <>
                          <Button icon="plus" type="primary" onClick={() => this.handleDictItemModal({ typeId: this.state.selectedKeysDict[0] }, 'add')}>新建</Button>
                          <Button icon="sync" ref="syncBtn" onClick={(e) => {
                            const syncBtn = this.refs.syncBtn;
                            syncBtn.setState({ loading: true });
                            this.refs.dictItemGrid.store.reload({
                              callback: function () {
                                syncBtn.setState({ loading: false });
                              }
                            });
                          }}>刷新</Button>
                        </>
                      )}
                      {selectedKeysDictItem.length > 0 && (
                        <span>
                          <Popconfirm title="你确定删除全部选中的记录吗？" onConfirm={e => {
                            e.preventDefault();
                            this.handleDictItemDelete(selectedKeysDictItem)
                          }}>
                            <Button type="danger" ghost>批量删除</Button>
                          </Popconfirm>
                        </span>
                      )}
                    </Col>
                    <Col xs={24} sm={7}>
                      <Search ref='dictItemSearch'
                        style={{
                          width: "auto",
                          float: "right"
                        }} placeholder="名称/组名" onSearch={(text) => this.handleDictItemSearch(text)} />
                    </Col>
                  </Row>
                </div>
                <NscGrid
                  ref="dictItemGrid"
                  columns={columnsDictItem}
                  pagination={false}
                  store={{
                    autoLoad: false
                  }}
                  rowSelection={rowSelectionDictItem}
                  style={{
                    height: "calc(100vh - 280px)"
                  }}
                />
              </Card>
            </Col>
          </Row>
        </GridContent>
        <DictEdit ref="dictEdit" />
        <DictItemEdit ref="dictItemEdit" />
      </PageHeaderWrapper >
    );
  }
}

export default connect(({ module }) => ({
  ...module,
}))(DictPage);