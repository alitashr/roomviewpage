import React, { PropTypes } from "react";
import { Card, Col, Row } from "antd";

const { Meta } = Card;
const gridStyle = {
  width: "33.33%",
  height: "30rem",
  textAlign: "center",
};

const EntrypointsDashboard = (props) => {
  return (
    <div className="at-entrypoints-dashboard">
      <Row>
        <Col span={24}>
          <Card title="Explorug Entry Points">
            <Card.Grid style={gridStyle}>
              <img
                alt="Cubinia in Bedroom Arcadus"
                className="entrypoints-cards"
                src="./test pages/Dashboard/Cubinia in Bedroom Arcadus.jpg"
                title="Cubinia in Bedroom Arcadus"
              />
              {/* <iframe
              className="entrypoints-cards"

                title="Cubinia in Bedroom Arcadus"
                id="iframe1"
                marginwidth="0"
                frameborder="0"
                width="100%"
                scrolling="auto"
                height="100%"
                marginheight="0"
                allow="camera"
                allowfullscreen=""
                src="https://entry.explorug.com/roomview/1/"
              ></iframe> */}
              <Meta title="Design Cubinia in Bedroom Arcadus" description="from Ruglife" />
            </Card.Grid>

            <Card.Grid style={gridStyle}>
              <img
                alt="Atlasia in Seashore"
                className="entrypoints-cards"
                src="./test pages/Dashboard/Atlasia in Seashore.jpg"
                title="Atlasia in Seashore"
              />

              <Meta title="Design Atlasia in Seashore" description="from Beyonddreams" />
            </Card.Grid>
            <Card.Grid style={gridStyle}>
              <img
                alt="Dream Kaleen in Roman Passage"
                className="entrypoints-cards"
                src="./test pages/Dashboard/Dream Kaleen in Roman Passage.jpg"
                title="Dream Kaleen in Roman Passage"
              />

              <Meta title="Design Dream Kaleen in Roman Passage" description="from Ruglife" />
            </Card.Grid>
          </Card>
          {/* <Card
    hoverable
    style={{ width: 240 }}
    cover={
     
  }
  >
    <Meta title="Europe Street beat" description="www.instagram.com" />
  </Card> */}
        </Col>
      </Row>
    </div>
  );
};

EntrypointsDashboard.propTypes = {};

export default EntrypointsDashboard;
