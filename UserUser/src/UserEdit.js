import React from 'react';
import { Modal } from 'antd';
import { NscForm, NscPageRequest } from 'nsc-framework-react-components';
import { request, utils } from 'nsc-framework-react-components/lib/utils';
import moment from 'moment';

const formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
};


class UserEdit extends NscPageRequest {

    onSaveOrUpdate = (fieldsValue) => {
        const _this = this,
            url = '/api/admin/users',
            type = this.getType();

        if (utils.isArray(fieldsValue.orgId)) {
            fieldsValue.orgId = fieldsValue.orgId[fieldsValue.orgId.length - 1];
        }
        const option = {
            method: type == 'add' ? 'POST' : 'PATCH',
            data: {
                ...this.getParams(),
                ...fieldsValue,
                birthdate: fieldsValue['birthdate'] == undefined ? null : fieldsValue['birthdate'].format('YYYY-MM-DD')
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
                title="系统用户"
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
                    <NscForm.Input name="username" label="用户名" required={true} decoratorProps={{ rules: [{ pattern: new RegExp("^[a-zA-Z0-9]{5,18}"), message: '请输入5到18位英文和数字组合！' }] }} />
                    <NscForm.Input name="realname" label="用户姓名" required={true} />
                    <NscForm.Cascader name="orgId" label="组织机构" required={true} url="/api/admin/organizations/tree" changeOnSelect labelField="name" />
                    <NscForm.Input name="position" label="职位" />
                    <NscForm.DatePicker name="birthdate" label="生日" style={{ width: '100%' }} />
                    <NscForm.Select name="sex" label="性别" viewname="v_sex" />
                    <NscForm.Input name="officeTel" label="办公电话" />
                    <NscForm.Input name="mobile" label="移动电话" decoratorProps={{ rules: [{ pattern: new RegExp("^((13[0-9])|(15[^4])|(18[0-9])|(17[0-9])|(147))\\d{8}$"), message: '电话格式不对！' }] }} />
                    <NscForm.Input name="email" label="邮箱" />
                    <NscForm.GroupRadio name="isValid" label="是否有效" required={true} initialValue={1} data={[{ value: 1, title: "是" }, { value: 0, title: "否" }]} />
                </NscForm>
            </Modal>
        );
    }

    beforeRender(params, type) {
        const form = this.refs.formpanel.getForm();
        form.resetFields();
        if (type == 'edit') {
            let url = '/api/admin/users/' + params.id;
            request(url, {
                callback: function (data) {
                    form.setFieldsValue({
                        username: data.username,
                        realname: data.realname,
                        orgId: data.orgId,
                        position: data.position,
                        birthdate: data.birthdate == null ? null : moment(data.birthdate, 'YYYY-MM-DD'),
                        sex: data.sex,
                        officeTel: data.officeTel,
                        mobile: data.mobile,
                        email: data.email,
                        isValid: data.isValid
                    });
                }
            });
        } else {
            form.setFieldsValue({
                orgId: params.orgId
            });
        }
    }
}
export default UserEdit;