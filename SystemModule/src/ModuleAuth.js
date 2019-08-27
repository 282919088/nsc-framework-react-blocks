import React, { Fragment } from 'react';
import { Modal, Row, Col, Input, Divider, Button, Popconfirm, Switch } from 'antd';
import { NscPageRequest, NscGrid } from 'nsc-framework-react';
import { request } from 'nsc-framework-react/lib/utils';
import ModuleAuthEdit from './ModuleAuthEdit';
import styles from './index.less';
const { Search } = Input;

class ModuleAuth extends NscPageRequest {
    state = {
        selectedRowKeys: [],
        syncIconSpin: false,
    }

    /**
     * 权限grid的columns
     */
    columns = [{
        title: '权限名称',
        dataIndex: 'authName',
        width: 150,
        sorter: true
    }, {
        title: '权限编码',
        dataIndex: 'authCode',
        width: 200,
        sorter: true,
    }, {
        title: '权限地址',
        dataIndex: 'action',
        width: 200,
        flex: 1,
        sorter: true
    }, {
        title: '请求方式',
        dataIndex: 'typeName',
        width: 150,
    }, {
        title: '是否有效',
        dataIndex: 'isValid',
        align: 'center',
        width: 100,
        render: (text, record) => (
            <Fragment>
                <Switch checkedChildren="开" unCheckedChildren="关" checked={text == 1} onChange={(value) => this.handleModuleAuthSwitchChange(value, record)} />
            </Fragment>
        ),
    }, {
        title: '序号',
        dataIndex: 'sort',
        align: 'center',
        width: 80,
    }, {
        title: '操作',
        align: 'center',
        width: 150,
        render: (text, record) => (
            <Fragment>
                <a onClick={e => {
                    e.preventDefault();
                    this.handleEditModule({
                        id: record.id,
                        moduleId: this.getParams("id"),
                        type: '01'
                    });
                }} >编辑</a>
                <Divider type="vertical" />
                <Popconfirm title="你确定删除吗?" onConfirm={e => {
                    e.preventDefault();
                    this.handleRemoveModule(record.id, '01');
                }}>
                    <a href="#">删除</a>
                </Popconfirm>
            </Fragment>
        )
    }];


    /**
     * 添加模块数据
     * @param {*} params 
     */
    handleAddModule(params) {
        const _this = this, { moduleAuthEdit, moduleAuthGrid } = this.refs;
        moduleAuthEdit.show({
            params: params,
            type: 'add',
            callback: function (result) {
                if (!result) return;
                moduleAuthGrid.store.reload();
            }
        });
    }

    //修改模块
    handleEditModule(params) {
        if (!params.id) {
            console.error("修改主键不能为空，非法操作！");
            return;
        }
        const _this = this, { moduleAuthEdit, moduleAuthGrid } = this.refs;
        moduleAuthEdit.show({
            params: params,
            type: 'edit',
            callback: function (result) {
                if (!result) return;
                moduleAuthGrid.store.reload();
            }
        });
    }

    /**
     * 
     * @param {*} id 要删除的模块ID
     * @param {*} type  00=目录  01=模块
     */
    handleRemoveModule(id, callback) {
        if (!id) {
            console.error("删除主键不能为空，非法操作！");
            return;
        }
        const _this = this;
        request("/api/admin/modules/auths/" + id, {
            method: "DELETE", callback: function (data) {
                _this.refs.moduleAuthGrid.store.reload({ callback: callback });
            }
        });
    }

    /**
     * 批量删除模块
     * @param {*} ids  模块ids
     * @param {*} type  00=目录 01=模块
     * @param {*} callback  完成回调
     */
    handleBatchRemoveModule(ids, callback) {
        if (!ids || ids.length == 0) {
            console.error("删除主键不能为空，非法操作！");
            return;
        }
        const _this = this;
        request("/api/admin/modules/auths", {
            method: "DELETE", data: { ids: ids }, callback: function (data) {
                _this.refs.moduleAuthGrid.store.reload({ callback: callback });
            }
        });
    }

    /**
     * 是否有效开关
     */
    handleModuleAuthSwitchChange = (value, record) => {
        let _this = this;
        let url = '/api/admin/modules/auths';
        let isValid = value == false ? 0 : 1;
        request(url, {
            method: 'PATCH', data: { "isValid": isValid, "id": record.id }, callback: function (data) {
                record.isValid = isValid;
                _this.refs.moduleAuthGrid.forceUpdate();

            }
        });
    }

    /**
     * grid选择改变
     */
    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    }

    render() {
        const _this = this;
        const { selectedRowKeys, syncIconSpin } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        console.log("--------->",styles.modal)
        return (
            <Modal
                visible={this.state.visible}
                width={null}
                className={styles.modal}
                forceRender
                title={this.state.title}
                okButtonProps={{ hidden: true }}
                cancelText="关闭"
                onCancel={() => {
                    this.close();
                }}
            >
                <div className={styles.tableListOperator}>
                    <Row gutter={10}>
                        <Col xs={24} sm={17}>
                            <Button icon="plus" type="primary" onClick={() => {
                                this.handleAddModule({
                                    moduleId: this.getParams("id"),
                                    type: 'GET'
                                });
                            }}>新建</Button>
                            <Button icon="sync" ref="syncBtn" onClick={(e) => {
                                const syncBtn = _this.refs.syncBtn;
                                syncBtn.setState({ loading: true });
                                this.refs.moduleAuthGrid.store.reload({
                                    callback: function () {
                                        syncBtn.setState({ loading: false });
                                    }
                                });
                            }}>刷新</Button>
                            {selectedRowKeys.length > 0 && (
                                <span>
                                    <Popconfirm title="你确定删除全部选中的模块吗？" onConfirm={e => {
                                        this.handleBatchRemoveModule(selectedRowKeys, function () {
                                            _this.setState({ selectedRowKeys: [] });
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
                            }} placeholder="权限名称" onSearch={(value) => {
                                _this.refs.moduleAuthGrid.store.reload({
                                    params: { name: value }
                                });
                            }} />
                        </Col>
                    </Row>
                </div>
                <NscGrid
                    ref="moduleAuthGrid"
                    columns={this.columns}
                    pagination={false}
                    rowSelection={rowSelection}
                />
                <ModuleAuthEdit ref="moduleAuthEdit"></ModuleAuthEdit>
            </Modal>
        )
    }

    beforeRender(params, type) {
        var _this = this;
        this.setState({ title: "权限维护『" + params.name + "』" });
        this.refs.moduleAuthGrid.store.load({
            url: '/api/admin/modules/' + params.id + '/auths'
        });
    }
}
export default ModuleAuth;