"use client"

import React, { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import requestLocationPermission from '@/app/location/requestLocationPermission';

const Map = () => {
  const [showWildfires, setShowWildfires] = useState(false);
  const [wildfireData, setWildfireData] = useState([]);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      const initialMap = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 4,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
          const approxLocation = {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
          };
          initialMap.setCenter(approxLocation);
          initialMap.setZoom(10);
          setMap(initialMap);
        })
        .catch(() => {
          console.error('Error: Failed to approximate location using IP.');
          requestLocationPermission(initialMap);
        });
    });
  }, []);

  useEffect(() => {
    if (showWildfires && map && !wildfireData.length) {
      const lat = map.getCenter().lat();
      const lng = map.getCenter().lng();
      const url = `https://api.ambeedata.com/fire/v2/latest/by-lat-lng?lat=${lat}&lng=${lng}`;

      fetch(url, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_AMBEE_API_KEY,
          'Content-type': 'application/json',
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.message === 'No data available.' || data.data.length === 0) {
            console.log('No wildfire data available.');
          } else {
            setWildfireData(data.result);
          }
        })
        .catch(error => {
          console.error('Error fetching wildfire data:', error);
        });
    }
  }, [showWildfires, map, wildfireData]);

  useEffect(() => {
    if (showWildfires && map && wildfireData.length) {
      const markers = wildfireData.map(wildfire => {
        const marker = new google.maps.Marker({
          position: { lat: wildfire.lat, lng: wildfire.lng },
          map,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
          },
        });

        marker.addListener('click', () => {
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

          infowindow.open(map, marker);
        });

        return marker;
      });

      return () => {
        markers.forEach(marker => marker.setMap(null));
      };
    }
  }, [showWildfires, map, wildfireData]);

  return (
    <main>
      <div id="map" style={{ width: '100%', height: '100vh' }}></div>
      <button
        onClick={() => setShowWildfires(!showWildfires)}
        className={`fixed top-4 right-4 ${showWildfires ? 'bg-orange-500' : 'bg-gray-500'
          } text-white px-4 py-2 rounded-md`}
      >
        Wildfires
      </button>
    </main>
  );
};

export default Map;
