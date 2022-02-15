import React, { PropTypes } from "react";
import { Card, Col, Row } from "antd";

const { Meta } = Card;
const gridStyle = {
  width: "33.33%",
  textAlign: "center",
};

const entrypointsList = [
  {
    coverImgUrl: "./Assets/Dashboard/Cubinia in Bedroom Arcadus.jpg",
    title: "Cubinia in Bedroom Arcadus",
    metaTitle: "Design Cubinia in Bedroom Arcadus",
    metaDesc: "from Ruglife",
    link: "https://entry.explorug.com/roomview/1/",
  },
  {
    coverImgUrl: "./Assets/Dashboard/Dream Kaleen in Roman Passage.jpg",
    title: "Dream Kaleen in Roman Passage",
    metaTitle: "Design Dream Kaleen in Roman Passage",
    metaDesc: "from Ruglife",
    link: "https://entry.explorug.com/roomview/3/",
  },
  {
    coverImgUrl: "./Assets/Dashboard/Atlasia in Seashore.jpg",
    title: "Atlasia in Seashore",
    metaTitle: "Design Atlasia in Seashore",
    metaDesc: "from Beyonddreams",
    link: "https://entry.explorug.com/roomview/2/",
  },
];

const EntrypointsDashboard = (props) => {
  const handleCardClick = (entrypoint) => {
    if (!entrypoint || !entrypoint.link) return;
    window.open(entrypoint.link, "_blank");
  };
  return (
    <div className="at-entrypoints-dashboard">
      <Row>
        <Col span={24}>
          <Card title="Explorug Entry Points">
            {entrypointsList.map((entrypoint, index) => (
              <Card.Grid style={gridStyle} onClick={() => handleCardClick(entrypoint)}>
                <img
                  alt={entrypoint.title}
                  className="entrypoints-cards"
                  src={entrypoint.coverImgUrl}
                  title={entrypoint.title}
                />
                <Meta title={entrypoint.metaTitle} description={entrypoint.metaDesc} />
              </Card.Grid>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

EntrypointsDashboard.propTypes = {};

export default EntrypointsDashboard;
