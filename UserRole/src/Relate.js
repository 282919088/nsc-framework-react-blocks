import React, { Component } from 'react';
import styles from './index.less';
import { Card, Row, Col, Icon, Divider, Input, Button, message } from 'antd';
import { NscGrid, NscIcon } from 'nsc-framework-react-components';
import { request } from 'nsc-framework-react-components/lib/utils';

export default class roleRelate extends Component {
  state = {
    selectedKeysRole: [],
    selectedKeysUnrelated: [],
    selectedKeysRelated: []
  }
  onClickRow = (event, record) => {
    let id = record.id;
    this.setState({ selectedKeysRole: [id] })
    this.refs.relatedGrid.store.load({ url: '/api/admin/roles/' + id + '/users' });
    this.refs.unrelatedGrid.store.load({ url: '/api/admin/roles/' + id + '/nousers' });
  }
  onSelectChangeUnrelated = (selectedRowKeys) => {
    this.setState({ selectedKeysUnrelated: selectedRowKeys })
  }
  onSelectChangeRelated = (selectedRowKeys) => {
    this.setState({ selectedKeysRelated: selectedRowKeys })
  }
  //创建关联
  handleCreateRelate = () => {
    const { selectedKeysRole, selectedKeysUnrelated } = this.state;
    if (selectedKeysUnrelated.length == 0) {
      message.warn("请选择无关联用户！")
    } else {
      let _this = this,
        url = '/api/admin/roles/' + selectedKeysRole[0] + '/users';
      request(url, {
        method: 'POST', data: selectedKeysUnrelated, callback: function (data) {
          _this.setState({ selectedKeysUnrelated: [] })
          _this.setState({ selectedKeysRelated: [] })
          _this.refs.relatedGrid.store.reload();
          _this.refs.unrelatedGrid.store.reload();
        }
      });
    }
  }
  //取消关联
  handleReleaseRelate = () => {
    const { selectedKeysRole, selectedKeysRelated } = this.state;
    if (selectedKeysRelated.length == 0) {
      message.warn("请选择已关联用户！")
    } else {
      let _this = this,
        url = '/api/admin/roles/' + selectedKeysRole[0] + '/users';
      request(url, {
        method: 'DELETE', data: selectedKeysRelated, callback: function (data) {
          _this.setState({ selectedKeysUnrelated: [] })
          _this.setState({ selectedKeysRelated: [] })
          _this.refs.relatedGrid.store.reload();
          _this.refs.unrelatedGrid.store.reload();
        }
      });
    }
  }
  handleRoleSearch = (e) => {
    this.refs.roleGrid.store.reload({
      params: {
        code: e.target.value//加条件
      }
    });
  }
  handleRelatedSearch = (e) => {
    this.refs.relatedGrid.store.reload({
      params: {
        code: e.target.value//加条件
      }
    });
  }
  handleUnrelatedSearch = (e) => {
    this.refs.unrelatedGrid.store.reload({
      params: {
        code: e.target.value//加条件
      }
    });
  }
  render() {
    const columnsRole = [{
      title: '角色编码',
      dataIndex: 'rolecode',
      key: 'rolecode'
    }, {
      title: '角色名',
      dataIndex: 'rolename',
      key: 'rolename',
    }];
    const columnsUser = [{
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    }, {
      title: '用户姓名',
      dataIndex: 'realname',
      key: 'realname',
    }];

    const { selectedKeysRole, selectedKeysUnrelated, selectedKeysRelated } = this.state

    const rowSelectionUnrelated = {
      selectedRowKeys: selectedKeysUnrelated,
      onChange: this.onSelectChangeUnrelated
    };
    const rowSelectionRelated = {//已关联的
      selectedRowKeys: selectedKeysRelated,
      onChange: this.onSelectChangeRelated
    };

    return (
      <>
        <Row gutter={10}>
          <Col xxl={7} xl={7} lg={7} md={24} sm={24} >
            <Card title="角色列表" bordered={false}>
              <Row gutter={10} style={{ marginBottom: '10px' }}>
                <Col xxl={24} xl={24} lg={24} md={24}>
                  <Input
                    ref="roleSearch"
                    addonAfter={
                      <div>
                        <Icon type="search" className={styles.icon} onClick={e => this.handleRoleSearch(e)} />
                        <Divider type="vertical" />
                        <NscIcon type="sync" ref="roleLoad" className={styles.icon} onClick={() => {
                          const _this = this,
                            treeRefreshIcon = this.refs.roleLoad;
                          treeRefreshIcon.setLoading(true);
                          this.refs.roleGrid.store.reload({
                            callback: function () {
                              treeRefreshIcon.setLoading(false);
                              _this.refs.relatedGrid.store.removeAll();
                              _this.refs.unrelatedGrid.store.removeAll();
                              _this.refs.relatedSearch.setValue("")
                              _this.refs.unrelatedSearch.setValue("")
                            }
                          });
                        }}
                        />
                      </div>
                    }
                    placeholder="搜索"
                    onPressEnter={e => this.handleRoleSearch(e)}
                  />
                </Col>
              </Row>
              <NscGrid
                ref="roleGrid"
                size="small"
                columns={columnsRole}
                pagination={{
                  showTotal: null
                }}
                store={{
                  autoLoad: true,
                  url: '/api/admin/roles'
                }}
                clickChangeColor={true}
                onRow={record => {
                  return {
                    onClick: event => this.onClickRow(event, record)
                  }
                }}
              // style={{
              //   height: "calc(100vh - 380px)"
              // }}
              />
            </Card>
          </Col>
          <Col xxl={8} xl={8} lg={8} md={11} sm={24}>
            <Card title="已关联用户" bordered={false}>
              <Row gutter={10} style={{ marginBottom: '10px' }}>
                <Col xxl={24} xl={24} lg={24} md={24}>
                  <Input
                    ref="relatedSearch"
                    addonAfter={
                      <div>
                        <Icon type="search" className={styles.icon} onClick={e => this.handleRelatedSearch(e)} />
                        <Divider type="vertical" />
                        <NscIcon type="sync" ref="relatedLoad" className={styles.icon} onClick={() => {
                          const treeRefreshIcon = this.refs.relatedLoad;
                          treeRefreshIcon.setLoading(true);
                          this.refs.relatedGrid.store.reload({
                            callback: function () {
                              treeRefreshIcon.setLoading(false);
                            }
                          });
                        }}
                        />
                      </div>
                    }
                    placeholder="用户名/用户姓名"
                    onPressEnter={e => this.handleRelatedSearch(e)}
                  />
                </Col>
              </Row>
              <NscGrid
                ref="relatedGrid"
                size="small"
                columns={columnsUser}
                pagination={false}
                store={{
                  autoLoad: false
                }}
                rowSelection={rowSelectionRelated}
              // style={{
              //   height: "calc(100vh - 380px)"
              // }}
              />
            </Card>
          </Col>
          <Col xxl={1} xl={1} lg={1} md={2} sm={24} className={styles.buttonGroup}>
            <Button className={styles.button} icon="double-right" onClick={() => this.handleReleaseRelate()}></Button>
            <Button className={styles.button} icon="double-left" onClick={() => this.handleCreateRelate()}></Button>
          </Col>
          <Col xxl={8} xl={8} lg={8} md={11} sm={24}>
            <Card title="无关联用户" bordered={false}>
              <Row gutter={10} style={{ marginBottom: '10px' }}>
                <Col xxl={24} xl={24} lg={24} md={24}>
                  <Input
                    ref="unrelatedSearch"
                    addonAfter={
                      <div>
                        <Icon type="search" className={styles.icon} onClick={e => this.handleUnrelatedSearch(e)} />
                        <Divider type="vertical" />
                        <NscIcon type="sync" ref="unrelatedLoad" className={styles.icon} onClick={() => {
                          const treeRefreshIcon = this.refs.unrelatedLoad;
                          treeRefreshIcon.setLoading(true);
                          this.refs.unrelatedGrid.store.reload({
                            callback: function () {
                              treeRefreshIcon.setLoading(false);
                            }
                          });
                        }}
                        />
                      </div>
                    }
                    placeholder="用户名/用户姓名"
                    onPressEnter={e => this.handleUnrelatedSearch(e)}
                  />
                </Col>
              </Row>
              <NscGrid
                ref="unrelatedGrid"
                size="small"
                columns={columnsUser}
                pagination={{
                  showTotal: null
                }}
                store={{
                  autoLoad: false
                }}
                rowSelection={rowSelectionUnrelated}
              // style={{
              //   height: "calc(100vh - 380px)"
              // }}
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}