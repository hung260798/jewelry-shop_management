import { Divider } from "antd";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { axiosClientJson } from "../../libraries/axiosClient";
import { GetMany, Order } from "@/utils/types/Entities";

type Position = {
  name: string;
  lat: number;
  lng: number;
};

const Address = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axiosClientJson.get<GetMany<Order>>(
          `/orders?fields[]=position`
        );
        if (!Array.isArray(response?.data?.results)) {
          return;
        }
        const orders = response.data.results;
        if (orders.length && orders.some((order) => order.position == null)) {
          return;
        }
        const fetchedPositions = response?.data?.results?.map((item) => ({
          name: item.position.name,
          lat: parseFloat(item.position.lat),
          lng: parseFloat(item.position.lng),
        }));
        setPositions(fetchedPositions);
      } catch (error) {
        console.log("Error fetching location:", error);
      }
    };
    fetchLocation();
  }, []);

  // const renderMarkers = (map: any, maps: any) => {
  //   positions.forEach((marker: any) => {
  //     new maps.Marker({
  //       position: marker.position,
  //       map,
  //       title: marker.name,
  //     });
  //   });
  // };
  // const vietnamCenter = {
  //   lat: 14.0583,
  //   lng: 108.2772,
  // };
  // const vietnamZoom = 5;
  return (
    <div className="Address">
      <div className="delivery active">
        <Divider>Vị trí khách hàng đã đặt hàng</Divider>
        {positions.length > 0 && (
          <div className="h-[50vh] w-full">
            {/* <GoogleMapReact
              bootstrapURLKeys={{
                key: "AIzaSyDc7PnOq3Hxzq6dxeUVaY8WGLHIePl0swY",
              }}
              defaultCenter={vietnamCenter}
              defaultZoom={vietnamZoom}
              yesIWantToUseGoogleMapApiInternals={true}
              onGoogleApiLoaded={({ map, maps }) => renderMarkers(map, maps)}
            /> */}
            <MapContainer
              center={[21.0285, 105.8542]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[21.0285, 105.8542]}>
                <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Address;
