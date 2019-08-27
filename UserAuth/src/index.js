import React, { Component, Fragment } from 'react';
import { Card, Row, Col, Tree, Input, Table, Switch, Tabs, Icon, Divider, message } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { NscTree, NscGrid, NscIcon } from 'nsc-framework-react';
import { request } from 'nsc-framework-react/lib/utils';
import styles from './index.less';

const TabPane = Tabs.TabPane;

export default class AssignRolePage extends Component {
    //Tab页签
    activeKey = "roleTab";
    //Grid选中行数据对象，Userid或RoleId
    selectedKey;

    /**
     * tab切换事件
     */
    handleTabChange = (activeKey) => {
        this.activeKey = activeKey;
        this.selectedKey = "";
        this.refs.treePanel.store.removeAll();
        if (activeKey == 'userTab') {
            this.refs.roleGrid.clearSelectColor();
        } else if (activeKey == 'roleTab') {
            this.refs.userGrid.clearSelectColor();
        }
    }
    /**
     * 点击用户Grid查询
     */
    onClickUserRow = (event, record) => {
        let id = record.id;
        this.selectedKey = id;
        this.refs.treePanel.store.load({ url: '/api/admin/users/' + id + '/auths' });
    }

    /**
     * 用户搜索
     */
    handleUserSearch = (e) => {
        this.refs.userGrid.store.reload({
            params: {
                code: e.target.value//加条件
            }
        });
    }
    /**
     * 点击角色Grid查询
     */
    onClickRoleRow = (event, record) => {
        let id = record.id;
        this.selectedKey = id;
        this.refs.treePanel.store.load({ url: '/api/admin/roles/' + id + '/auths' });
    }
    /**
     * 角色搜索
     */
    handleRoleSearch = (e) => {
        this.refs.roleGrid.store.reload({
            params: {
                code: e.target.value//加条件
            }
        });
    }
    /**
     * 权限菜单树搜索
     */
    handleTreeSearch = (e) => {
        this.refs.treePanel.handleSearch(e.target.value);
    }
    /**
     * 权限菜单树保存
     */
    handleTreeSave = () => {
        const checkedNodes = this.refs.treePanel.getCheckedAllNodes();
        let url = '', keyid = '', menuIds = [], authIds = [];
        if (this.activeKey == 'userTab') {
            url = '/api/admin/users/auths';
            keyid = { userid: this.selectedKey }
        } else if (this.activeKey == 'roleTab') {
            url = '/api/admin/roles/auths'
            keyid = { roleid: this.selectedKey }
        }
        checkedNodes.forEach(node => {
            let param1 = node.attribute.param1,
                id = node.key;
            if (param1 == '00') {
                menuIds.push(id);
            } else if (param1 == '01') {
                authIds.push(id);
            }
        });
        console.log(menuIds, authIds)
        request(url, {
            method: 'POST', data: {
                menuIds: menuIds,
                authIds: authIds,
                ...keyid
            }, callback: function (data) {
                message.success("保存成功！")
            }
        });
    }

    render() {
        const roleColumns = [
            {
                title: '角色编码',
                dataIndex: 'rolecode',
                key: 'rolecode',
            }, {
                title: '角色名称',
                dataIndex: 'rolename',
                key: 'rolename',
            }];
        const userColumns = [
            {
                title: '用户账号',
                dataIndex: 'username',
                key: 'username',
            }, {
                title: '用户姓名',
                dataIndex: 'realname',
                key: 'realname',
            }];
        return (
            <PageHeaderWrapper title={false}>
                <GridContent>
                    <Row gutter={10}>
                        <Col lg={9} md={11} lg={9} xl={7}>
                            <Card bordered={false}>
                                <Tabs defaultActiveKey="roleTab" onChange={(activeKey) => this.handleTabChange(activeKey)}>
                                    <TabPane tab="角色" key="roleTab">
                                        <Input
                                            ref="roleSearch"
                                            addonAfter={
                                                <div>
                                                    <Icon type="search" onClick={e => this.handleRoleSearch(e)} />
                                                    <Divider type="vertical" />
                                                    <NscIcon type="sync" ref="roleLoad" onClick={() => {
                                                        const treeRefreshIcon = this.refs.roleLoad;
                                                        treeRefreshIcon.setLoading(true);
                                                        this.refs.roleGrid.store.reload({
                                                            callback: function () {
                                                                treeRefreshIcon.setLoading(false);
                                                            }
                                                        });
                                                    }}
                                                    />
                                                </div>
                                            }
                                            placeholder="角色名称"
                                            onPressEnter={e => this.handleRoleSearch(e)}
                                        />
                                        <NscGrid
                                            ref="roleGrid"
                                            size="small"
                                            columns={roleColumns}
                                            pagination={{
                                                showSizeChanger: false,
                                                showQuickJumper: false
                                            }}
                                            store={{
                                                autoLoad: true,
                                                url: '/api/admin/roles'
                                            }}
                                            onRow={record => {
                                                return {
                                                    onClick: event => this.onClickRoleRow(event, record)
                                                }
                                            }}
                                            clickChangeColor={true}
                                        />
                                    </TabPane>
                                    <TabPane tab="用户" key="userTab">
                                        <Input
                                            ref="userSearch"
                                            addonAfter={
                                                <div>
                                                    <Icon type="search" onClick={e => this.handleUserSearch(e)} />
                                                    <Divider type="vertical" />
                                                    <NscIcon type="sync" ref="userLoad" onClick={() => {
                                                        const treeRefreshIcon = this.refs.userLoad;
                                                        treeRefreshIcon.setLoading(true);
                                                        this.refs.userGrid.store.reload({
                                                            callback: function () {
                                                                treeRefreshIcon.setLoading(false);
                                                            }
                                                        });
                                                    }}
                                                    />
                                                </div>
                                            }
                                            placeholder="用户名/用户姓名"
                                            onPressEnter={e => this.handleUserSearch(e)}
                                        />
                                        <NscGrid
                                            ref="userGrid"
                                            size="small"
                                            columns={userColumns}
                                            pagination={{
                                                showSizeChanger: false,
                                                showQuickJumper: false
                                            }}
                                            store={{
                                                autoLoad: true,
                                                url: '/api/admin/users'
                                            }}
                                            onRow={record => {
                                                return {
                                                    onClick: event => this.onClickUserRow(event, record)
                                                }
                                            }}
                                            clickChangeColor={true}
                                        />
                                    </TabPane>
                                </Tabs>
                            </Card>
                        </Col>
                        <Col lg={15} md={13} lg={15} xl={17}>
                            <Card bordered={false}>
                                <Input
                                    ref="treeSearch"
                                    addonAfter={
                                        <div>
                                            <Icon type="search" onClick={e => this.handleTreeSearch(e)} />
                                            <Divider type="vertical" />
                                            <NscIcon type="sync" ref="treeLoad" onClick={() => {
                                                const treeRefreshIcon = this.refs.treeLoad;
                                                treeRefreshIcon.setLoading(true);
                                                this.refs.treePanel.store.reload({
                                                    callback: function () {
                                                        treeRefreshIcon.setLoading(false);
                                                    }
                                                });
                                            }}
                                            />
                                            <Divider type="vertical" />
                                            <Icon type="check" onClick={e => this.handleTreeSave()} />
                                        </div>
                                    }
                                    placeholder="搜索"
                                    onPressEnter={e => this.handleTreeSearch(e)}
                                />
                                <NscTree
                                    ref="treePanel"
                                    store={{
                                        autoLoad: false
                                    }}
                                    renderTreeNode={(props) => {
                                        if (props.description) {
                                            props.title = props.title + "『" + props.description + "』"
                                        }
                                        return props;
                                    }}
                                    checkable
                                ></NscTree>
                            </Card>
                        </Col>
                    </Row>
                </GridContent>
            </PageHeaderWrapper>
        );
    }
}