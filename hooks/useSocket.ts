'use client';

import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { createSocket, createAuthToken } from '@/lib/game/socket';

export function useSocket(user: { fid: number; username: string; address: string } | null) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        if (!user) return;

        const newSocket = createSocket();
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✅ Socket connected');
            setConnected(true);

            // Auto-authenticate
            const token = createAuthToken(user.fid, user.username, user.address);
            newSocket.emit('authenticate', { token });
        });

        newSocket.on('authenticated', (data) => {
            console.log('✅ Authenticated:', data);
            setAuthenticated(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setConnected(false);
            setAuthenticated(false);
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return () => {
            newSocket.close();
        };
    }, [user]);

    const emit = useCallback(
        (event: string, data?: any) => {
            if (socket && connected) {
                socket.emit(event, data);
            }
        },
        [socket, connected]
    );

    return {
        socket,
        connected,
        authenticated,
        emit,
    };
}
