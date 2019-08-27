import React, { Component } from 'react';
import { Modal } from 'antd';
import { NscForm, NscPageRequest } from 'nsc-framework-react';
import { request } from 'nsc-framework-react/lib/utils';

const formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
};


class DictItemEdit extends NscPageRequest {
    onSaveOrUpdate = (fieldsValue) => {
        const _this = this,
            url = '/api/admin/dicts/items/',
            type = this.getType();
        const option = {
            method: type == 'add' ? 'POST' : 'PATCH',
            data: {
                ...this.getParams(),
                ...fieldsValue
            },
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
                title="字典表"
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
                    <NscForm.Input name="name" label="名称" required={true} />
                    <NscForm.Input name="code" label="代码编号" required={true} />
                    <NscForm.Input name="groupName" label="组名" />
                    <NscForm.InputNumber name="sort" label="排序" />
                    <NscForm.GroupRadio name="isValid" label="是否有效" required={true} initialValue={1} data={[{ value: 1, title: "是" }, { value: 0, title: "否" }]} />
                </NscForm>
            </Modal>
        );
    }

    beforeRender(params, type) {
        if (!this.refs.formpanel) return;
        const form = this.refs.formpanel.getForm();
        form.resetFields();
        if (type == 'edit') {
            let url = '/api/admin/dicts/items/' + params.id;
            request(url, {
                callback: function (data) {
                    form.setFieldsValue({
                        name: data.name,
                        code: data.code,
                        groupName: data.groupName,
                        sort: data.sort,
                        isValid: data.isValid
                    });
                }
            })
        }
    }
}
export default DictItemEdit;