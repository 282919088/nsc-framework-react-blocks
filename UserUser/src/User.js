import React, { Component, Fragment } from 'react';
import styles from './index.less';
import { Card, Row, Col, Icon, Divider, Popconfirm, Input, Button, Switch, message, Dropdown, Menu } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import { NscTree, NscGrid, NscIcon } from 'nsc-framework-react-components';
import { request } from 'nsc-framework-react-components/lib/utils';
import UserEdit from './UserEdit';

const { Search } = Input;


export default class UserPage extends Component {
    state = {
        selectedOrgId: null,
        selectedKeys: []
    };

    //组织机构树搜索
    handleTreeSearch = (e, ref) => {
        this.refs[ref].handleSearch(e.target.value);
    }
    //组织机构树点击事件
    handleTreeClick = (selectedKeys, info) => {
        const orgid = selectedKeys.length > 0 ? selectedKeys[0] : null;
        this.refs.gridUser.store.reload({
            params: {
                orgid: orgid
            }
        });
        this.setState({ selectedOrgId: orgid })
    }

    //新建 编辑 用户
    handleUserEdit = (params, type) => {
        let _this = this;
        this.refs.useredit.show({
            params: params,
            type: type,
            callback: function (result) {
                _this.refs.gridUser.store.reload();
            }
        });
    }
    //删除用户
    handleDelete = (ids) => {
        let _this = this;
        let url = '/api/admin/users';
        request(url, {
            method: 'DELETE', data: { "ids": ids }, callback: function (data) {
                _this.refs.gridUser.store.reload();
                message.success("删除成功！");
            }
        });
    }
    //表格勾选事件
    onSelectChange = (selectedKeys) => {
        this.setState({ selectedKeys: selectedKeys });
    }
    //表格搜索
    handleGridSerach = (text) => {
        this.refs.gridUser.store.reload({
            params: {
                code: text//加条件
            }
        });
    }
    //重置密码
    handleReset = (id) => {
        let url = '/api/admin/users/rest/' + id;
        request(url, {
            method: 'PATCH', callback: function (data) {
                message.success("密码重置成功！");
            }
        });
    }
    //改状态
    handleSwitchChange = (value, record) => {
        let _this = this,
            url = '/api/admin/users',
            isValid = value == false ? 0 : 1,
            data = {
                id: record.id,
                realname: record.realname,
                orgId: record.orgId,
                isValid: isValid
            };
        request(url, {
            method: 'PATCH', data: data, callback: function (data) {
                record.isValid = isValid;
                _this.refs.gridUser.forceUpdate();
            }
        });
    }

    MoreBtn = props => (
        <Dropdown
            overlay={
                <Menu>
                    <Menu.Item key="edit">
                        <Popconfirm title="你确定删除吗?" onConfirm={e => {
                            e.preventDefault();
                            this.handleDelete([props.record.id])
                        }}>
                            <a href="#">删除</a>
                        </Popconfirm>
                    </Menu.Item>
                    <Menu.Item key="delete"><a onClick={() => this.handleReset([props.record.id])} >重置密码</a></Menu.Item>
                </Menu>
            }
        >
            <a> 更多 <Icon type="down" /></a>
        </Dropdown>
    );
    columns = [
        { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
        { title: '姓名', dataIndex: 'realname', key: 'realname', width: 120 },
        { title: '组织机构', dataIndex: 'orgName', key: 'orgName', width: 150, },
        { title: '职位', dataIndex: 'position', key: 'position', width: 150, },
        { title: '性别', dataIndex: 'sexName', key: 'sexName', width: 100, },
        { title: '移动电话', dataIndex: 'mobile', key: 'mobile', width: 120, },
        {
            title: '是否有效', dataIndex: 'isValid', width: 100, align: 'center', render: (text, record) => (
                <Fragment>
                    <Switch checkedChildren="开" unCheckedChildren="关" checked={record.isValid == 1 ? true : false}
                        onChange={(value) => this.handleSwitchChange(value, record)} />
                </Fragment>
            ),
        }, {
            title: '操作', width: 150, align: 'center', render: (text, record) => (
                <Fragment>
                    <a onClick={() => this.handleUserEdit({ id: record.id }, 'edit')} >编辑</a>
                    <Divider type="vertical" />
                    <this.MoreBtn record={record} />
                </Fragment>
            )
        }];

    render() {
        const { selectedKeys } = this.state;
        const rowSelection = {
            selectedRowKeys: selectedKeys,
            onChange: this.onSelectChange
        };
        return (
            <>
                <GridContent>
                    <Row gutter={10}>
                        <Col xxl={5} xl={6} lg={7} md={9} >
                            <Card bordered={false}>
                                <Input
                                    ref="treeSearch"
                                    addonAfter={
                                        <div>
                                            <Icon type="search" className={styles.icon} onClick={e => this.handleTreeSearch(e, 'treePanel')} />
                                            <Divider type="vertical" />
                                            <NscIcon type="sync" ref="treeLoad" className={styles.icon} onClick={() => {
                                                const treeRefreshIcon = this.refs.treeLoad;
                                                treeRefreshIcon.setLoading(true);
                                                this.refs.treePanel.store.reload({
                                                    callback: function () {
                                                        treeRefreshIcon.setLoading(false);
                                                    }
                                                });
                                            }} />
                                        </div>
                                    }
                                    placeholder="搜索"
                                    onPressEnter={e => this.handleTreeSearch(e, 'treePanel')}
                                />
                                <NscTree
                                    ref="treePanel" className={styles.tableContainer}
                                    onSelect={(selectedKeys, info) => this.handleTreeClick(selectedKeys, info)}
                                    store={{
                                        autoLoad: true,
                                        url: '/api/admin/organizations/treenode'
                                    }}
                                ></NscTree>
                            </Card>
                        </Col>
                        <Col xxl={19} xl={18} lg={17} md={15}>
                            <Card bordered={false}>
                                <div className={styles.tableListOperator}>
                                    <Row gutter={10}>
                                        <Col xs={24} sm={24} md={24} lg={17}>
                                            <Button icon="plus" type="primary" onClick={() => this.handleUserEdit({ orgId: this.state.selectedOrgId }, 'add')}>新建</Button>
                                            <Button icon="sync" ref="syncBtn" onClick={(e) => {
                                                const syncBtn = this.refs.syncBtn;
                                                syncBtn.setState({ loading: true });
                                                this.refs.gridUser.store.reload({
                                                    callback: function () {
                                                        syncBtn.setState({ loading: false });
                                                    }
                                                });
                                            }}>刷新</Button>
                                            <Button icon="download" onClick={() => { }}>导出</Button>
                                            {selectedKeys.length > 0 && (
                                                <span>
                                                    <Popconfirm title="你确定删除全部选中的记录吗？" onConfirm={e => {
                                                        e.preventDefault();
                                                        this.handleDelete(selectedKeys)
                                                    }}>
                                                        <Button type="danger" ghost>批量删除</Button>
                                                    </Popconfirm>
                                                </span>
                                            )}
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={7}>
                                            <Search ref='userSearch' placeholder="用户账号/用户姓名" onSearch={(text) => this.handleGridSerach(text)} />
                                        </Col>
                                    </Row>
                                </div>
                                <NscGrid
                                    ref="gridUser"
                                    columns={this.columns}
                                    pagination={{
                                        showSizeChanger: true,
                                        showQuickJumper: true
                                    }}
                                    store={{
                                        autoLoad: true,
                                        url: '/api/admin/users'
                                    }}
                                    rowSelection={rowSelection}
                                    className={styles.tableContainer}
                                />
                            </Card>
                        </Col>
                    </Row>
                </GridContent>
                <UserEdit ref="useredit" />
            </>
        );
    }
}