import React from "react";
import { Layout, Row, Col, Card } from "antd";
import Map from "./components/Map";
const { Content } = Layout;
const App = () => (
  <Layout>
    Colombia map
    <Content style={{ padding: 30 }}>
      <Row>
        <Col span={20}>
          {/* <Map /> */}
          this is just a test
        </Col>
        <Col span={4}>
          {/* <Map /> */}
          just a test
        </Col>
      </Row>
      map
      <Content>
        <Row>
          <Col span={14}>
            <Card size="small" title="Contagios" style={{ height: window.innerHeight }}>
              <Map />
            </Card>
          </Col>
        </Row>
      </Content>
    </Content>
  </Layout>
);

export default App;
