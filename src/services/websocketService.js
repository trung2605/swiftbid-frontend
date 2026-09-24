import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * WebSocket (STOMP over SockJS) service for real-time auction price updates (FR-BID-05).
 * The backend broadcasts an AuctionPriceUpdate payload to /topic/auctions/{auctionId}
 * every time a bid is accepted (see BidServiceImpl.broadcastUpdate on the backend).
 */

const WS_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

/**
 * Subscribes to live price updates for a single auction.
 * @param {number|string} auctionId
 * @param {(update: {auctionId:number, currentHighestBidAmount:number, currentHighestBidderUsername:string, bidCount:number}) => void} onUpdate
 * @returns {() => void} unsubscribe/cleanup function — call it (e.g. in a useEffect cleanup) to disconnect.
 */
export function subscribeToAuction(auctionId, onUpdate) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`),
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe(`/topic/auctions/${auctionId}`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          onUpdate(payload);
        } catch (err) {
          console.error('Error parsing auction price update:', err);
        }
      });
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame.headers?.message, frame.body);
    },
  });

  client.activate();

  return () => {
    client.deactivate();
  };
}

const websocketService = { subscribeToAuction };
export default websocketService;
