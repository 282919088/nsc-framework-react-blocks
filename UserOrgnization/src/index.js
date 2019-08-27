import React, { Component, Fragment, PureComponent } from 'react';
import { Icon, Switch, Popconfirm, Divider, Row, Col, Card, Input, Button } from 'antd';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { NscGrid } from 'nsc-framework-react';
import { request } from 'nsc-framework-react/lib/utils';
import OrganizationEdit from './OrganizationEdit';
import styles from './index.less';

const { Search } = Input;


export default class OrganizationPage extends Component {

    //新建，编辑弹框
    handleEdit = (params, type) => {
        let _this = this;
        this.refs.organizationEdit.show({
            params: params,
            type: type,
            callback: function (result) {
                _this.refs.gridOrganization.store.reload();
            }
        });
    }
    //删除
    handleDelete = (deleteKey) => {
        let _this = this;
        let url = '/api/admin/organizations/' + deleteKey;
        request(url, {
            method: 'DELETE', callback: function (data) {
                _this.refs.gridOrganization.store.reload();
            }
        });
    }
    //搜索
    handleSearch = (text) => {
        this.refs.gridOrganization.handleSearch(text, { keyField: 'key', titleField: 'name', pathsField: "paths" });
    }
    //改状态
    handleSwitchChange = (value, record) => {
        let _this = this,
            url = '/api/admin/organizations',
            isValid = value == false ? 0 : 1;
        request(url, {
            method: 'PATCH', data: { "isValid": isValid, "id": record.id }, callback: function (data) {
                record.isValid = isValid;
                _this.refs.gridOrganization.forceUpdate();
            }
        });
    }
    render() {
        const columns = [
            { title: '机构名称', dataIndex: 'name', key: 'name', width: 250 },
            { title: '机构类型', dataIndex: 'typeName', key: 'typeName', width: 120 },
            { title: '负责人', dataIndex: 'managerId', key: 'managerId', width: 120 },
            { title: '电话', dataIndex: 'telephone', key: 'telephone', width: 100 },
            // { title: '地址', dataIndex: 'address', key: 'address', flex: 1 },
            // { title: '描述', dataIndex: 'description', key: 'description', flex: 1 },
            {
                title: '是否有效', dataIndex: 'isValid', align: 'center', width: 100, render: (text, record) => (
                    <Fragment>
                        <Switch
                            checkedChildren="开"
                            unCheckedChildren="关"
                            checked={record.isValid == 1 ? true : false}
                            onChange={(value) => this.handleSwitchChange(value, record)} />
                    </Fragment>
                )
                , width: 100
            }, {
                title: '操作', width: 120, align: 'center', render: (text, record) => (
                    <Fragment>
                        <a onClick={() => this.handleEdit({ parentId: record.id }, 'add')} >新建</a>
                        <Divider type="vertical" />
                        <a onClick={() => this.handleEdit({ id: record.id }, 'edit')} >编辑</a>
                        <Divider type="vertical" />
                        <Popconfirm title="你确定删除吗?" onConfirm={e => {
                            e.preventDefault();
                            this.handleDelete(record.id)
                        }}>
                            <a href="#">删除</a>
                        </Popconfirm>

                    </Fragment>
                )
            }
        ];
        return (
            <PageHeaderWrapper title={false}>
                <GridContent>
                    <Card bordered={false}>
                        <div className={styles.tableListOperator}>
                            <Row gutter={10}>
                                <Col xs={24} sm={17}>
                                    <Button icon="plus" type="primary" onClick={() => this.handleEdit({ parentId: '-1' }, 'add')}>新建</Button>
                                    <Button icon="sync" ref="syncBtn" onClick={(e) => {
                                        const syncBtn = this.refs.syncBtn;
                                        syncBtn.setState({ loading: true });
                                        this.refs.gridOrganization.store.reload({
                                            callback: function () {
                                                syncBtn.setState({ loading: false });
                                            }
                                        });
                                    }}>刷新</Button>
                                    <Button icon="download">导出</Button>
                                </Col>
                                <Col xs={24} sm={7}>
                                    <Search placeholder="机构名称" onSearch={(text) => this.handleSearch(text)} />
                                </Col></Row>
                        </div>
                        <NscGrid
                            ref="gridOrganization"
                            size="middle"
                            columns={columns}
                            pagination={false}
                            store={{
                                autoLoad: true,
                                url: '/api/admin/organizations/tree'
                            }}
                            style={{
                                height: "calc(100vh - 280px)"
                            }}
                        />
                    </Card>
                </GridContent>
                <OrganizationEdit ref="organizationEdit" />
            </PageHeaderWrapper>

        );
    }

}