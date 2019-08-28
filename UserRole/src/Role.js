import React, { Component } from 'react';
import styles from './index.less';
import { Card, Divider, Input, Button, Switch, Popconfirm, Row, Col } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import { NscGrid } from 'nsc-framework-react-components';
import { request } from 'nsc-framework-react-components/lib/utils';
import RoleEdit from './RoleEdit';
const { Search } = Input;

export default class RolePage extends Component {
    state = {
        selectedKeys: []
    };

    //新建 编辑 用户
    handleRoleEdit = (params, type) => {
        let _this = this;
        this.refs.roleedit.show({
            params: params,
            type: type,
            callback: function (result) {
                _this.refs.gridRole.store.reload();
            }
        });
    }
    //删除用户
    handleDelete = (ids) => {
        let _this = this;
        let url = '/api/admin/roles';
        request(url, {
            method: 'DELETE', data: { "ids": ids }, callback: function (data) {
                _this.refs.gridRole.store.reload();
            }
        });
    }
    //表格勾选事件
    onSelectChange = (selectedKeys) => {
        this.setState({ selectedKeys: selectedKeys });
    }
    //表格搜索
    handleGridSerach = (text) => {
        //前台搜索，待封装
        this.refs.gridRole.store.reload({
            params: {
                code: text//加条件
            }
        });
    }
    //改状态
    handleSwitchChange = (value, record) => {
        let _this = this,
            url = '/api/admin/roles',
            isValid = value == false ? 0 : 1,
            data = {
                id: record.id,
                isValid: isValid
            };
        request(url, {
            method: 'PATCH', data: data, callback: function (data) {
                record.isValid = isValid;
                _this.refs.gridRole.forceUpdate();
            }
        });
    }
    render() {
        const columns = [{
            title: '角色编码',
            dataIndex: 'rolecode',
            key: 'rolecode',
            flex: 1
        }, {
            title: '角色名',
            dataIndex: 'rolename',
            key: 'rolename',
            flex: 1
        }, {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            flex: 1
        }, {
            title: '类型',
            dataIndex: 'roleTypeName',
            key: 'roleTypeName',
            flex: 1
        }, {
            title: '是否有效',
            dataIndex: 'isValid',
            width: 150,
            render: (text, record) => (
                <>
                    <Switch checkedChildren="开" unCheckedChildren="关" checked={record.isValid == "0" ? false : true}
                        onChange={(value) => this.handleSwitchChange(value, record)} />
                </>
            ),
        }, {
            title: '操作',
            width: 150,
            render: (text, record) => (
                <>
                    <a onClick={() => this.handleRoleEdit({ id: record.id }, 'edit')} >编辑</a>
                    <Divider type="vertical" />
                    <Popconfirm title="你确定删除吗?" onConfirm={e => {
                        e.preventDefault();
                        this.handleDelete([record.id])
                    }}>
                        <a href="#">删除</a>
                    </Popconfirm>
                </>
            ),
        },];
        const { selectedKeys } = this.state;
        const rowSelection = {
            selectedRowKeys: selectedKeys,
            onChange: this.onSelectChange
        };

        return (
            <>
                <GridContent>
                    <Card bordered={false}>
                        <div className={styles.tableListOperator}>
                            <Row gutter={10}>
                                <Col xs={24} sm={17}>
                                    <Button icon="plus" type="primary" onClick={() => this.handleRoleEdit({}, 'add')}>新建</Button>
                                    <Button icon="sync" ref="syncBtn" onClick={(e) => {
                                        const syncBtn = this.refs.syncBtn;
                                        syncBtn.setState({ loading: true });
                                        this.refs.gridRole.store.reload({
                                            callback: function () {
                                                syncBtn.setState({ loading: false });
                                            }
                                        });
                                    }}>刷新</Button>
                                    <Button icon="download">导出</Button>
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
                                <Col xs={24} sm={7}>
                                    <Search placeholder="角色名" onSearch={(text) => this.handleGridSerach(text)} />
                                </Col>
                            </Row>
                        </div>
                        <NscGrid
                            ref="gridRole"
                            columns={columns}
                            pagination={{
                                showSizeChanger: true,
                                showQuickJumper: true
                            }}
                            store={{
                                autoLoad: true,
                                url: '/api/admin/roles'
                            }}
                            rowSelection={rowSelection}
                            style={{
                                height: "calc(100vh - 330px)"
                            }}
                        />
                    </Card>
                </GridContent>
                <RoleEdit ref="roleedit" />
            </>
        );
    }
}