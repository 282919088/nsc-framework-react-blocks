import React from 'react';
import { Modal } from 'antd';
import { NscForm, NscPageRequest } from 'nsc-framework-react-components';
import { request } from 'nsc-framework-react-components/lib/utils';

const formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
};


class RoleEdit extends NscPageRequest {

    onSaveOrUpdate = (fieldsValue) => {
        const _this = this,
            url = '/api/admin/roles',
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
    };

    render() {
        const { visible } = this.props;

        return (
            <Modal
                visible={this.state.visible}
                width={640}
                forceRender
                title="系统角色"
                onOk={() => {
                    var form = this.refs.formpanel.getForm();
                    form.validateFields((err, fieldsValue) => {
                        if (err) return;
                        this.onSaveOrUpdate(fieldsValue);
                    });
                }}
                onCancel={() => { this.close(); }}
            >
                <NscForm ref="formpanel" layout="horizontal"  {...formLayout}>
                    <NscForm.Input name="rolecode" label="角色编码" required={true} />
                    <NscForm.Input name="rolename" label="角色名" required={true} />
                    <NscForm.TextArea name="description" label="描述" />
                    <NscForm.Select name="roleType" label="类型" viewname="v_roletype" />
                    <NscForm.GroupRadio name="isValid" label="是否有效" required={true} initialValue={1} data={[{ value: 1, title: "是" }, { value: 0, title: "否" }]} />
                </NscForm>
            </Modal>
        );
    }

    beforeRender(params, type) {
        const form = this.refs.formpanel.getForm();
        form.resetFields();
        debugger
        if (type == 'edit') {
            let url = '/api/admin/roles/' + params.id;
            request(url, {
                callback: function (data) {
                    form.setFieldsValue({
                        rolecode: data.rolecode,
                        rolename: data.rolename,
                        description: data.description,
                        roleType: data.roleType,
                        isValid: data.isValid
                    });
                }
            });
        }
    }
}
export default RoleEdit;