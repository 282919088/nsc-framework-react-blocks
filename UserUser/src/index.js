import React, { Component, Fragment } from 'react';
import { PageHeaderWrapper} from '@ant-design/pro-layout';
import AccountListPage from './User';
import UserRelate from './Relate'
import { Tabs, Card } from 'antd';

const TabPane = Tabs.TabPane;


export default class UserPage extends Component {

    render() {
        return (
            <PageHeaderWrapper  title={false}> 
                <Tabs defaultActiveKey="1" animated={false}>
                    <TabPane tab="系统用户" key="1">
                        <AccountListPage />
                    </TabPane>
                    <TabPane tab="角色分配" key="2">
                        <UserRelate />
                    </TabPane>
                </Tabs>
            </PageHeaderWrapper>
        );
    }
}