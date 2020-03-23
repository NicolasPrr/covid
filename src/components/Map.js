import * as React from "react";
import DataSet from "@antv/data-set";

import axios from "axios";
import {
  LineLayer,
  MapboxScene,
  PolygonLayer,
  PointLayer,
  Control,
  Popup,
  LayerEvent,
} from "@antv/l7-react";

import Departaments from "../data/city";

function sumXY(coordinates) {
  /*Coordinates is a array [[X1,Y1], [X2,Y2] ...[xn.yn]]
  0: (2) [-76.30729675220047, 8.619299889431787]
  1: (2) [-76.29810333270866, 8.616399764640406]
  .
  .
  .
*/
  //Averages
  let x = 0;
  let y = 0;
  let newCoordinates = coordinates;

  if (coordinates.length === 1) {
    newCoordinates = coordinates[0];
  }
  for (let i = 0; i < newCoordinates.length; i++) {
    x += newCoordinates[i][0];
    y += newCoordinates[i][1];
  }

  return {
    centroidX: x / newCoordinates.length,
    centroidY: y / newCoordinates.length
  };
}
function getCentroids(data) {
  data.features.map(feature => {
    const { centroidX, centroidY } = sumXY(feature.geometry.coordinates[0]);
    feature.properties["centroid"] = [centroidX, centroidY];
    feature.properties["confirmedCount"] = 20;
  });
}
function joinData(data, countObject) {
  // let features = data.features
  for (let prop in countObject) {
    let index = data.features.findIndex(
      feature =>
        parseInt(feature.properties["DPTO"]) ===
        parseInt(countObject[prop].code)
    );
    if (index !== -1) {
      data.features[index].properties["confirmedCount"] =
        countObject[prop].count;
    }
  }
}
const World = React.memo(function Map() {
  const [data, setData] = React.useState();
  const [point, setPoint] = React.useState();
  const [fly, setFly] = React.useState();
  const [popupInfo, setPopupInfo] = React.useState();

  //

  React.useEffect(() => {
    const fetchData = async () => {
      //get data departaments geomap.json
      const response = await fetch(
        "https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/3aadedf47badbdac823b00dbe259f6bc6d9e1899/colombia.geo.json"
      );
      let data = await response.json();
      // setPoint(npoint, );
      // setData(data);
      // getCentroids(data);
      axios
        .get(
          "https://raw.githubusercontent.com/dfuribez/COVID-19-Colombia/master/dataset.csv"
        )
        .then(res => {
          const dv = new DataSet.View().source(res.data, {
            type: "csv"
          });
          let countByCity = {};
          const rows = dv.rows;
          for (let i = 0; i < rows.length; i++) {
            if (countByCity[rows[i].ciudad] === undefined) {
              const code = Departaments.find(departament =>
                departament.ciudades.includes(rows[i].ciudad)
              ).c_digo_dane_del_departamento;
              countByCity[rows[i].ciudad] = { count: 1, code: code };
            } else {
              const count = countByCity[rows[i].ciudad].count;
              countByCity[rows[i].ciudad].count = count + 1;
            }
          }
          getCentroids(data);
          joinData(data, countByCity);

          const npoint = data.features.map(feature => {
            return feature.properties;
          });
          setPoint(npoint);
          setData(data);
          console.log("npoint ", npoint);

          console.log("data:  ", data);
        });
    };

    fetchData();
    const dataFlyTest = [
      {
        coord: [
          [-75.83552264434908, 7.001176054433129],
          [-74.21105069962759, 4.285993532528952]
        ]
      }
    ];
    setFly(dataFlyTest);
  }, []);
  function showPopup(args){
    console.log(args)
    args.feature && setPopupInfo({
      lnglat: args.lngLat,
      feature: args.feature,
    });
  }
  
  return (
    <div>

    <MapboxScene
      map={{
        pitch: 30,
        style: "blank",
        zoom: 0.1
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
              {popupInfo && (
          <Popup lnglat={popupInfo.lnglat}>
            {popupInfo.feature.name}
            <ul
              style={{
                margin: 0,
              }}
            >
              <li>Departamento :{popupInfo.feature["NOMBRE_DPT"]}</li>
              <li>Confirmados :{popupInfo.feature.confirmedCount}</li>
            </ul>
          </Popup>
        )}
      {data && [
        <PolygonLayer
          key={"1"}
          options={{
            autoFit: true
          }}
          source={{
            data
          }}
          color={{
            field: "DPTO",
            values: [
              "#2E8AE6",
              "#69D1AB",
              "#DAF291",
              "#FFD591",
              "#FF7A45",
              "#CF1D49",
              "#f4f1f2",
            ]
          }}
          shape={{
            values: "fill"
          }}
          style={{
            opacity: 1
          }}
          // select={{
          //   option: { color: "#000" }
          // }}
        />,
        <LineLayer
          key={"5"}
          source={{
            data
          }}
          size={{
            values: 0.5
          }}
          color={{
            values: "#000000"
          }}
          shape={{
            values: "line"
          }}
          style={{
            opacity: 1
          }}
        />,
        //Linefly
        // <LineLayer
        //   key={"2"}
        //   source={{
        //     data: fly,
        //     parser: {
        //       type: "json",
        //       coordinates: "coord"
        //     }
        //   }}
        //   size={{
        //     values: 2
        //   }}
        //   color={{
        //     values: "#ff6b34"
        //   }}
        //   shape={{
        //     values: "arc3d"
        //   }}
        //   active={{ values: true }}
        //   style={{
        //     opacity: 1
        //   }}
        //   animate={{
        //     interval: 2,
        //     trailLength: 2,
        //     duration: 1
        //   }}
        // />,
        <PointLayer
          key={"3"}
          options={{
            autoFit: true
          }}
          source={{
            data: point,
            parser: {
              type: "json",
              coordinates: "centroid"
            }
          }}
          scale={{
            values: {
              confirmedCount: {
                type: "log"
              }
            }
          }}
          color={{
            values: "#b10026"
          }}
          shape={{
            // values: "circle"
            values: "circle"
            // values: "circle"
          }}
          active={{
            option: {
              color: "#0c2c84"
            }
          }}
          size={{
            field: "confirmedCount",
            values: [7, 20]
          }}
          animate={{
            enable: false
          }}
          style={{
            opacity: 0.9
          }}
        >
          <LayerEvent type="click" handler={e => showPopup(e)} />
        </PointLayer>,
        
      ]}
      <Control type="scale" />
      <Control type="zoom" />
    </MapboxScene>
    </div>
  );
});

export default World;
