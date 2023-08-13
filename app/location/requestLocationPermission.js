export default function requestLocationPermission(map) {
  if (navigator.permissions) {
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        if (permissionStatus.state === "prompt") {
          permissionStatus.onchange = () => {
            if (permissionStatus.state === "granted") {
              handleAcceptLocation(map);
            } else if (permissionStatus.state === "denied") {
              console.error("Error: Location permission denied.");
            }
          };
          const consent = window.confirm(
            "We couldn't determine your location. Do you want to share your location?",
          );
          if (consent) {
            navigator.geolocation.getCurrentPosition(
              function (position) {
                const userLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                map.setCenter(userLocation);
                map.setZoom(12);
              },
              function () {
                console.error("Error: The Geolocation service failed.");
              },
            );
          }
        } else if (permissionStatus.state === "granted") {
          handleAcceptLocation(map);
        } else if (permissionStatus.state === "denied") {
          console.error("Error: Location permission denied.");
        }
      });
  } else {
    console.error("Error: Geolocation permission not available.");
  }
}

const handleAcceptLocation = (map) => {
  if (navigator.geolocation && map) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userLocation);
        map.setZoom(12);
      },
      function () {
        console.error("Error: The Geolocation service failed.");
      },
    );
  } else {
    console.error("Error: Geolocation not available or map not initialized.");
  }
};
