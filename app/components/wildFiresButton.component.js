import React, { useState, useEffect } from "react";

const WildfiresButton = ({ map, apiKey }) => {
  const [showWildfires, setShowWildfires] = useState(false);
  const [wildfiresData, setWildfiresData] = useState(null);

  const fetchWildfires = () => {
    if (!wildfiresData) {
      fetch(
        `https://api.breezometer.com/fires/v1/area-monitoring/active?key=${apiKey}`,
      )
        .then((response) => response.json())
        .then((data) => setWildfiresData(data));
    }
  };

  const toggleWildfires = () => {
    setShowWildfires(!showWildfires);
    if (!showWildfires) {
      fetchWildfires();
    }
  };

  useEffect(() => {
    if (showWildfires && wildfiresData) {
      const markers = wildfiresData.map((wildfire) => {
        const marker = new google.maps.Marker({
          position: { lat: wildfire.lat, lng: wildfire.lng },
          map,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
          },
        });

        const content = `
          <div>
            <h3>Wildfire Information</h3>
            <p><strong>Cause:</strong> ${wildfire.cause}</p>
            <p><strong>Size:</strong> ${wildfire.size} acres</p>
            <p><strong>Status:</strong> ${wildfire.status}</p>
          </div>
        `;

        const infowindow = new google.maps.InfoWindow({
          content,
        });

        marker.addListener("click", () => {
          infowindow.open(map, marker);
        });

        return marker;
      });

      return () => {
        markers.forEach((marker) => marker.setMap(null));
      };
    }
  }, [showWildfires, wildfiresData]);

  return (
    <button
      className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded"
      onClick={toggleWildfires}
    >
      Wildfires
    </button>
  );
};

export default WildfiresButton;
