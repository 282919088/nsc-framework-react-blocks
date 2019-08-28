import React, { Component } from 'react';
import styles from './index.less';
import { Card, Row, Col, Icon, Divider, Input, Button, message } from 'antd';
import { NscGrid, NscIcon } from 'nsc-framework-react-components';
import { request } from 'nsc-framework-react-components/lib/utils';

export default class UserRelate extends Component {
  state = {
    selectedKeysUser: [],
    selectedKeysUnrelated: [],
    selectedKeysRelated: []
  }
  onClickRow = (event, record) => {
    let id = record.id;
    this.setState({ selectedKeysUser: [id] })
    this.refs.relatedGrid.store.load({ url: '/api/admin/users/' + id + '/roles' });
    this.refs.unrelatedGrid.store.load({ url: '/api/admin/users/' + id + '/noroles' });
  }
  onSelectChangeUnrelated = (selectedRowKeys) => {
    this.setState({ selectedKeysUnrelated: selectedRowKeys })
  }
  onSelectChangeRelated = (selectedRowKeys) => {
    this.setState({ selectedKeysRelated: selectedRowKeys })
  }
  //创建关联
  handleCreateRelate = () => {
    const { selectedKeysUser, selectedKeysUnrelated } = this.state;
    if (selectedKeysUnrelated.length == 0) {
      message.warn("请选择未关联角色！")
    } else {
      let _this = this,
        url = '/api/admin/users/' + selectedKeysUser[0] + '/roles';
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
    const { selectedKeysUser, selectedKeysRelated } = this.state;
    if (selectedKeysRelated.length == 0) {
      message.warn("请选择已关联角色！")
    } else {
      let _this = this,
        url = '/api/admin/users/' + selectedKeysUser[0] + '/roles';
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
  handleUserSearch = (e) => {
    this.refs.userGrid.store.reload({
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
    const columnsRole = [
      { title: '角色编码', dataIndex: 'rolecode', key: 'rolecode' },
      { title: '角色名', dataIndex: 'rolename', key: 'rolename', }
    ];
    const columnsUser = [
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '用户姓名', dataIndex: 'realname', key: 'realname', }
    ];

    const { selectedKeysUser, selectedKeysUnrelated, selectedKeysRelated } = this.state
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
            <Card title="账号列表" bordered={false}>
              <Row gutter={10} style={{ marginBottom: '10px' }}>
                <Col xxl={24} xl={24} lg={24} md={24} >
                  <Input
                    ref="userSearch"
                    addonAfter={
                      <div>
                        <Icon type="search" className={styles.icon} onClick={e => this.handleUserSearch(e)} />
                        <Divider type="vertical" />
                        <NscIcon type="sync" ref="userLoad" className={styles.icon} onClick={() => {
                          const _this = this,
                            treeRefreshIcon = this.refs.userLoad;
                          treeRefreshIcon.setLoading(true);
                          this.refs.userGrid.store.reload({
                            callback: function () {
                              treeRefreshIcon.setLoading(false);
                              _this.refs.relatedGrid.store.removeAll();
                              _this.refs.unrelatedGrid.store.removeAll();
                              _this.refs.relatedSearch.setValue("")
                              _this.refs.unrelatedSearch.setValue("")
                            }
                          });
                        }} />
                      </div>
                    }
                    placeholder="搜索"
                    onPressEnter={e => this.handleUserSearch(e)}
                  />
                </Col>
              </Row>
              <NscGrid
                ref="userGrid"
                size="small"
                columns={columnsUser}
                pagination={{
                  showTotal: null
                }}
                store={{
                  autoLoad: true,
                  url: '/api/admin/users'
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
          <Col xxl={8} xl={8} lg={8} md={11} sm={24}>
            <Card title="已关联角色" bordered={false}>
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
                        }} />
                      </div>
                    }
                    placeholder="角色名"
                    onPressEnter={e => this.handleRelatedSearch(e)}
                  />
                </Col>
              </Row>
              <NscGrid
                ref="relatedGrid"
                columns={columnsRole}
                pagination={false}
                size="small"
                store={{
                  autoLoad: false
                }}
                rowSelection={rowSelectionRelated}
              />
            </Card>
          </Col>
          <Col xxl={1} xl={1} lg={1} md={2} sm={24} className={styles.buttonGroup}>
            <Button icon="double-right" className={styles.button} onClick={() => this.handleReleaseRelate()}></Button>
            <Button icon="double-left" className={styles.button} onClick={() => this.handleCreateRelate()}></Button>
          </Col>
          <Col xxl={8} xl={8} lg={8} md={11} sm={24}>
            <Card title="未关联角色" bordered={false}>
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
                        }} />
                      </div>
                    }
                    placeholder="角色名"
                    onPressEnter={e => this.handleUnrelatedSearch(e)}
                  />
                </Col>
              </Row>
              <NscGrid
                ref="unrelatedGrid"
                columns={columnsRole}
                pagination={{
                  showTotal: null
                }}
                size="small"
                store={{
                  autoLoad: false
                }}
                rowSelection={rowSelectionUnrelated}
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}