import React, { Component } from 'react';
import { Modal, message } from 'antd';
import { NscForm, NscPageRequest } from 'nsc-framework-react';
import { request, utils } from 'nsc-framework-react/lib/utils';
import moment from 'moment';

const formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
};


class OrganizationEdit extends NscPageRequest {

    onSaveOrUpdate = (fieldsValue) => {
        const _this = this,
            url = '/api/admin/organizations',
            type = this.getType();
        if (utils.isArray(fieldsValue.parentId)) {
            fieldsValue.parentId = fieldsValue.parentId[fieldsValue.parentId.length - 1];
        }
        const data = {
            ...this.getParams(),
            ...fieldsValue
        }
        if (data.parentId == data.id) {
            message.warn("上级目录不能为自己！");
            return;
        }
        const option = {
            method: type == 'add' ? 'POST' : 'PATCH',
            data: data, callback: function (data) {
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
                title="组织机构"
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
                    <NscForm.Input name="name" label="机构名称" required={true} />
                    <NscForm.Input name="code" label="机构编码" required={true} />
                    <NscForm.Select name="type" label="机构类型" viewname="v_orgtype" />
                    <NscForm.Input name="managerId" label="负责人" />
                    <NscForm.Cascader name="parentId" label="上级单位" url="/api/admin/organizations/tree" changeOnSelect labelField="name" />
                    <NscForm.Input name="telephone" label="电话" />
                    <NscForm.Input name="address" label="地址" />
                    <NscForm.TextArea name="description" label="描述" />
                    <NscForm.GroupRadio name="isValid" label="是否有效" required={true} initialValue={1} data={[{ value: 1, title: "是" }, { value: 0, title: "否" }]} />
                </NscForm>
            </Modal>
        );
    }

    beforeRender(params, type) {
        const form = this.refs.formpanel.getForm();
        form.resetFields();
        if (type == 'edit') {
            let url = '/api/admin/organizations/' + params.id;
            request(url, {
                callback: function (data) {
                    form.setFieldsValue({
                        name: data.name,
                        code: data.code,
                        type: data.type,
                        managerId: data.managerId,
                        parentId: data.parentId,
                        telephone: data.telephone,
                        address: data.address,
                        description: data.description,
                        isValid: data.isValid
                    });
                }
            });
        } else if (type == 'add') {
            //新建
            form.setFieldsValue(params);
        }
    }
}
export default OrganizationEdit;