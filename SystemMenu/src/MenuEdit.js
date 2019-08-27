import React, { PureComponent } from 'react';
import { Form, Button, Modal, Radio, Drawer, Icon, message, Row, Col } from 'antd';
import { NscForm, NscPageRequest } from 'nsc-framework-react';
import { request, utils } from 'nsc-framework-react/lib/utils';
import moment from 'moment';
const FormItem = Form.Item;

class MenuEdit extends NscPageRequest {

    onSaveOrUpdate(fieldsValue) {
        const _this = this,
            url = "/api/admin/menus",
            type = this.getType();
        if (utils.isArray(fieldsValue.parentId)) {
            fieldsValue.parentId = fieldsValue.parentId[fieldsValue.parentId.length - 1];
        }
        if (utils.isArray(fieldsValue.moduleId)) {
            fieldsValue.moduleId = fieldsValue.moduleId[fieldsValue.moduleId.length - 1];
        }
        const data = {
            ...this.getParams(),
            ...fieldsValue
        }
        if (data.parentId == data.id) {
            message.warn("上级目录不能为自己！");
            return;
        }
        if (!data.parentId) {
            data.parentId = -1;
        }
        const option = {
            method: type == 'add' ? 'POST' : 'PATCH',
            data: data, callback: function (data) {
                _this.close(data);
            }
        }
        request(url, option);
    }

    render() {
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        return (
            <Modal
                visible={this.state.visible}
                width={640}
                forceRender
                centered
                title={this.state.title}
                onOk={() => {
                    var form = this.refs.formpanel.getForm();
                    form.validateFields((err, fieldsValue) => {
                        if (err) return;
                        this.onSaveOrUpdate(fieldsValue);
                    });
                }}
                onCancel={() => {
                    this.close();
                }}
            >
                <NscForm ref="formpanel" layout="horizontal"  {...formItemLayout}>
                    <NscForm.Input name="name" label="菜单名称" required={true} />
                    <NscForm.Cascader name="parentId" label="上级目录" url="/api/admin/menus/tree" changeOnSelect />
                    <NscForm.Select name="type" label="菜单类型" required={true} viewname="v_menutype" />
                    <NscForm.Input name="icon" label="菜单图标" />
                    <NscForm.Input name="iconCls" label="图标Cls" />
                    <NscForm.Cascader name="moduleId" label="关联模块" url="/api/admin/modules/selecttree" changeOnSelect />
                    <NscForm.TextArea name="description" label="备注信息" />
                    <NscForm.GroupRadio name="isValid" label="是否有效" initialValue={1} data={[{ value: 1, title: "是" }, { value: 0, title: "否" }]} />
                </NscForm>
            </Modal>
        )
    }

    beforeRender(params, type) {
        var _this = this;
        const form = _this.refs.formpanel.getForm();
        form.resetFields();
        if (type == 'add') {
            this.setState({ title: '添加菜单' });
            form.setFieldsValue(utils.pick(params, ['name', 'parentId', 'icon', 'isValid', 'type', 'iconCls', 'moduleId','description']));
        } else if (type == 'edit') {
            this.setState({ title: '修改菜单' });
            request("/api/admin/menus/" + params.id, {
                callback: function (data) {
                    form.setFieldsValue(utils.pick(data, ['name', 'parentId', 'icon', 'isValid', 'type', 'iconCls', 'moduleId','description']));
                }
            });
        }
    }
}
export default MenuEdit;