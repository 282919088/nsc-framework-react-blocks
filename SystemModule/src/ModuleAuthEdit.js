import React from 'react';
import { Form, Modal} from 'antd';
import { NscForm, NscPageRequest } from 'nsc-framework-react';
import { request, utils } from 'nsc-framework-react/lib/utils';

class ModuleAuthEdit extends NscPageRequest {

    onSaveOrUpdate(fieldsValue) {
        const _this = this,
            url = "/api/admin/modules/auths",
            type = this.getType();
        const data = {
            ...this.getParams(),
            ...fieldsValue
        }
        const option = {
            method: type == 'add' ? 'POST' : 'PATCH',
            data: data,
            callback: function (data) {
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
                    <NscForm.Input name="authName" label="权限名称" required={true} />
                    <NscForm.Input name="authCode" label="权限编码" required={true} />
                    <NscForm.Input name="action" required={true} label="权限地址" />
                    <NscForm.Select name="type" label="请求方式" required={true} viewname="v_methodtype" />
                    <NscForm.TextArea name="description" label="描述" />
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
            this.setState({ title: '添加模块权限' });
            form.setFieldsValue(utils.pick(params, ['name', 'parentId', 'url', 'isValid', 'type']));
        } else if (type == 'edit') {
            this.setState({ title: '修改模块权限' });
            request("/api/admin/modules/auths/" + params.id, {
                callback: function (data) {
                    form.setFieldsValue(utils.pick(data, ['authCode', 'authName', 'action', 'type', 'description', 'isValid']));
                }
            });
        }
    }
}
export default ModuleAuthEdit;