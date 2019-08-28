import React, { Component } from 'react';
import styles from './style.less';
import { Card, Row, Col, Button } from 'antd';
import { PageHeaderWrapper, GridContent} from '@ant-design/pro-layout';
import moment from 'moment';
import { NscGrid, NscForm } from 'nsc-framework-react-components';
class LoginLog extends Component {

    handleFormSubmit = () => {
        var _this = this, form = this.refs.formpanel.getForm();
        form.validateFields((err, fieldsValue) => {
            let params = { username: fieldsValue.realname }
            let loginTime = fieldsValue.loginTime;
            if (loginTime && loginTime.length == 2) {
                params.loginTime = [loginTime[0].format('YYYY-MM-DD HH:mm:ss'), loginTime[1].format('YYYY-MM-DD HH:mm:ss')];
            }
            _this.refs.sysLogGrid.store.load({ params: params });
        });
    }

    handleFormReset = () => {
        this.refs.formpanel.getForm().resetFields();
        this.refs.sysLogGrid.store.load({ params: {} });
    }

    render() {
        const columns = [{
            title: '登录人',
            dataIndex: 'realname',
            key: 'realname',
            sorter: true
        }, {
            title: '登录时间',
            dataIndex: 'loginDate',
            sorter: true,
            render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
        }, {
            title: '登出时间',
            dataIndex: 'logoutDate',
            sorter: true,
            render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
        }, {
            title: '登录方式',
            dataIndex: 'loginTypeName',
            key: 'loginTypeName'
        }, {
            title: '登出方式',
            dataIndex: 'logoutTypeName'
        }, {
            title: '请求ip',
            dataIndex: 'ipaddress',
            key: 'ipaddress',
        }, {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark'
        }];

        const selectedRows = [{ key: '1' }];

        const formItemLayout = {
            labelCol: {
                xs: { span: 6 },
                sm: { span: 4 },
                md: { span: 6 },
                lg: { span: 6 },
                xl: { span: 6 },
                xxl: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 18 },
                sm: { span: 20 },
                md: { span: 18 },
                lg: { span: 18 },
                xl: { span: 18 },
                xxl: { span: 20 },
            },
        }
        return (
            <PageHeaderWrapper title={false}>
                <GridContent>
                    <Card bordered={false}>
                        <div>
                            <NscForm ref="formpanel" layout="inline" {...formItemLayout} className={styles.fromStyle}>
                                <Row gutter={24}>
                                    <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                        <NscForm.RangePicker name="loginTime" label="登录时间" style={{ width: '100%' }}
                                            showTime={{
                                                hideDisabledOptions: true,
                                                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                                            }}
                                            ranges={{
                                                "今天": [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                                                '本月': [moment().startOf('month'), moment().endOf('month')],
                                            }}
                                        />
                                    </Col>
                                    <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                        <NscForm.Select name="realname" label="登录人" url="/api/admin/platform/group/users" mode="multiple" />
                                    </Col>
                                    <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                        <Button type="primary" htmlType="submit" onClick={this.handleFormSubmit}>查询</Button>
                                        <Button onClick={this.handleFormReset}>重置</Button>
                                    </Col>
                                </Row>
                            </NscForm>
                        </div>

                        <NscGrid
                            ref="sysLogGrid"
                            columns={columns}
                            pagination={{
                                showSizeChanger: false,
                                showQuickJumper: false
                            }}
                            store={{
                                autoLoad: true,
                                url: '/api/admin/loginlogs'
                            }}
                            style={{
                                height: "calc(100vh - 320px)"
                            }}
                        />
                    </Card>
                </GridContent>
            </PageHeaderWrapper >
        );
    }
}
export default LoginLog;