import React, { Component, Fragment } from 'react';
import { Card, Row, Col, Icon, Input, Button, Tabs } from 'antd';
import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { NscGrid, NscForm } from 'nsc-framework-react';
import { StandardFormRow } from 'nsc-framework-react/lib/antd';
import styles from './style.less';
import moment from 'moment';
const { TabPane } = Tabs;
class SystemLog extends Component {
    activeKey = "1";

    renderForm() {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                lg: { span: 6 },
                xxl: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                lg: { span: 18 },
                xxl: { span: 20 },
            },
        };
        return (
            <NscForm ref="formpanel" layout="inline" {...formItemLayout}  className={styles.fromStyle}>
                <StandardFormRow title="请求方式" block >
                    <NscForm.TagSelect name="methodType" viewname="v_methodtype" expandable />
                </StandardFormRow>
                <StandardFormRow title="其它选项" grid >
                    <Row gutter={24}>
                        <Col xxl={8} xl={8} lg={12} xs={24}>
                            <NscForm.Input name="title" placeholder="内容搜索" />
                        </Col>
                        <Col xxl={8} xl={8} lg={12} xs={24}>
                            <NscForm.Select name="username" label="操作者" url="/api/admin/platform/group/users" mode="multiple" />
                        </Col>
                        <Col xxl={8} xl={8} lg={24} xs={24}>
                            <NscForm.RangePicker name="createDate" label="操作时间" style={{ width: '100%' }} showTime={true}
                                showTime={{
                                    hideDisabledOptions: true,
                                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                                }}
                                ranges={{
                                    "今天": [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                                    '本月': [moment().startOf('month'), moment().endOf('month')],
                                }}
                                itemProps={
                                    {
                                        labelCol: { lg: { span: 3 }, xl: { span: 6 }, xxl: { span: 4 }, },
                                        wrapperCol: { lg: { span: 21 }, xl: { span: 18 }, xxl: { span: 20 }, }
                                    }
                                } />
                        </Col>
                    </Row>
                </StandardFormRow>
                <Row gutter={24}>
                    <Col style={{ textAlign: 'center' }}>
                        <span>
                            <Button type="primary" onClick={this.handleFormSubmit} >查询 </Button>
                            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
                        </span>
                    </Col>
                </Row>
            </NscForm>
        );
    }

    onTabsChange = (key) => {
        this.activeKey = key;
    }

    handleFormSubmit = () => {
        var _this = this, form = this.refs.formpanel.getForm();
        form.validateFields((err, fieldsValue) => {
            let params = { value: fieldsValue.title, methodType: fieldsValue.methodType, username: fieldsValue.username }
            let createDate = fieldsValue.createDate;
            if (createDate && createDate.length == 2) {
                params.createDate = [createDate[0].format('YYYY-MM-DD HH:mm:ss'), createDate[1].format('YYYY-MM-DD HH:mm:ss')];
            }
            if (_this.activeKey == "1") {
                _this.refs.operateLogGrid.store.load({ params: params });
            } else {
                _this.refs.errorLogGrid.store.load({ params: params });
            }
        });
    }

    handleFormReset = () => {
        this.refs.formpanel.getForm().resetFields();
        if (this.activeKey == "1") {
            this.refs.operateLogGrid.store.load({ params: {} });
        } else {
            this.refs.errorLogGrid.store.load({ params: {} });
        }
    }

    render() {
        const columns = [
            {
                title: '日志标题',
                dataIndex: 'title',
                width: 120,
                sorter: true,
            }, {
                title: '请求方式',
                dataIndex: 'methodType',
                width: 120,
                sorter: true,
            }, {
                title: '请求uri',
                dataIndex: 'uri',
                width: 120,
                sorter: true,
            }, {
                title: '耗时(毫秒)',
                dataIndex: 'elapsed',
                width: 120,
                align: 'right',
                sorter: true,
            }, {
                title: '操作IP',
                dataIndex: 'ipaddress',
                width: 120,
                align: 'center',
                sorter: true,
            }, {
                title: '操作用户',
                dataIndex: 'realname',
                width: 100,
                sorter: true,
            }, {
                title: '状态码',
                dataIndex: 'status',
                width: 100,
                align: 'center',
                sorter: true,
            }, {
                title: '操作时间',
                dataIndex: 'createDate',
                width: 180,
                align: 'center',
                sorter: true,
                render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>
            }];

        return (
            <PageHeaderWrapper title={false}>
                <GridContent>
                    <Card bordered={false}>
                        <div>
                            {this.renderForm()}
                        </div>
                    </Card>
                    <Card
                        style={{ marginTop: 24 }}
                        bordered={false}
                        bodyStyle={{ padding: '8px 32px 32px 32px' }}>
                        <Tabs defaultActiveKey={this.activeKey} animated={false} onChange={(key) => this.onTabsChange(key)}>
                            <TabPane tab="操作日志" key="1">
                                <NscGrid
                                    columns={columns}
                                    ref="operateLogGrid"
                                    store={{
                                        autoLoad: true,
                                        url: '/api/admin/syslog/00'
                                    }}
                                />
                            </TabPane>
                            <TabPane tab="异常日志" key="2">
                                <NscGrid
                                    columns={columns}
                                    ref="errorLogGrid"
                                    store={{
                                        autoLoad: true,
                                        url: '/api/admin/syslog/01'
                                    }}
                                />
                            </TabPane>
                        </Tabs>
                    </Card>
                </GridContent>
            </PageHeaderWrapper >
        );
    }
}
export default SystemLog;