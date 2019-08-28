import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import RolePage from './Role';
import RoleRelate from './Relate'
import { Tabs } from 'antd';

const TabPane = Tabs.TabPane;


export default class AssignPage extends Component {

    render() {
        return (
            <PageHeaderWrapper title={false}>
                {/* <Card bordered={false}> */}
                <Tabs defaultActiveKey="1" animated={false}>
                    <TabPane tab="角色列表" key="1">
                        <RolePage />
                    </TabPane>
                    <TabPane tab="用户分配" key="2">
                        <RoleRelate />
                    </TabPane>
                </Tabs>
                {/* </Card> */}
            </PageHeaderWrapper>
        );
    }
}