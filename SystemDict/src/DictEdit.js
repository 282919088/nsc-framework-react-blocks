import React, { Component } from 'react';
import { Modal } from 'antd';
import { NscForm, NscPageRequest } from 'nsc-framework-react-components';
import { request } from 'nsc-framework-react-components/lib/utils';

const formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
};


class DictEdit extends NscPageRequest {

    onSaveOrUpdate = (fieldsValue) => {
        const _this = this,
            url = '/api/admin/dicts',
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
                title="字典对照表"
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
                    <NscForm.Input name="viewName" label="视图名称" required={true} />
                    <NscForm.TextArea name="remark" label="描述" required={true} />
                    <NscForm.Select name="type" label="类型" required={true} viewname="v_dicttype" />
                    <NscForm.GroupRadio name="isValid" label="是否有效" required={true} initialValue={1} data={[{ value: 1, title: "是" }, { value: 0, title: "否" }]} />
                </NscForm>
            </Modal>
        );
    }

    beforeRender(params, type) {
        const form = this.refs.formpanel.getForm();
        form.resetFields();
        if (type == 'edit') {
            let url = '/api/admin/dicts/' + params.id;
            request(url, {
                callback: function (data) {
                    form.setFieldsValue({
                        viewName: data.viewName,
                        remark: data.remark,
                        type: data.type,
                        isValid: data.isValid
                    });
                }
            });
        }
    }
}
export default DictEdit;