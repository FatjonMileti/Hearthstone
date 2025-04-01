import React, { HTMLAttributes } from 'react';
import { styled } from '@mui/system';
import { useLocation, useNavigate } from '../../compat/router';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

import { Typography, ShowGlobalLoading, Button } from '../../components/index';

import { Conversation } from './Conversation';
import { ChatBox } from './ChatBox/ChatBox';
import { HeaderLoggedIn } from '../PagesComponents/HeaderLoggedIn/HeaderLoggedIn';
import { MessagesProperties } from './Messages.Properties';

import axios from '../../utils/axios';

import SocketContext from '../../context/SocketContext';
import { useUserStore } from '../../globalState/user';
import { useNotificationsStore } from '../../globalState/notifications';

import { IMessageItem, IRoom } from './messages.interface';

import noMessages from './noMessages.png';
import { Footer } from '../Home/Footer';

import { MatchDetails } from './MatchDetails/MatchDetails';
import { HearthstoneAssistance } from './LostfishAssistance';

export const Messages = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  const userStore = useUserStore();
  const notificationsStore = useNotificationsStore();

  const { socket } = React.useContext(SocketContext);

  const [room, setRoom] = React.useState<IRoom | null>(null);

  const [messages, setMessages] = React.useState<IMessageItem[]>([]);

  const [conversations, setConversations] = React.useState<IRoom[]>([]);

  const [filterByProperty, setFilterByProperty] = React.useState('');

  const queryParams = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();

  const reorderMessages = (data: any) => {
    const filteredRooms = conversations.filter((room: IRoom) => room._id.toString() !== data._id.toString());
    const oldRoom = conversations.find((r) => r._id === data._id);

    if (oldRoom) {
      setConversations([
        {
          ...oldRoom,
          unseen_messages: data.unseen_messages,
          last_message: data.last_message
        },
        ...filteredRooms
      ]);
    }
  };

  // @ts-ignore
  React.useEffect(() => {
    if (socket) {
      socket.on('update_message_list', reorderMessages);

      return () => {
        socket.off('update_message_list');
      };
    }
  }, [reorderMessages]);

  React.useEffect(() => {
    handleMatchIdInQueryParams();
  }, []);

  const handleMatchIdInQueryParams = async () => {
    try {
      const matchIdInQueryParams = queryParams.get('matchId');

      if (matchIdInQueryParams) {
        const room = await getRoomWithMatchId(matchIdInQueryParams);
        if (room) {
          chatRooms.refetch().then((response) => {
            const foundRoom = response?.data?.find((r) => r._id === room._id);

            if (foundRoom) {
              joinRoom(foundRoom);
            }
          });
        }
        navigate('/messages');
      }
    } catch (err) {
      throw err;
    }
  };

  const getRoomWithMatchId = async (matchId: string): Promise<IRoom | false> => {
    try {
      const { data } = await axios(userStore.auth.access_token).get(`/api/chat/matches/${matchId}`);
      return data;
    } catch (err) {
      return false;
    }
  };

  const chatRooms = useQuery<IRoom[]>(
    ['messages', filterByProperty],
    async (): Promise<any[]> => {
      const { data } = await axios(userStore.auth.access_token).get<{ docs: IRoom[] }>('/api/chat', {
        params: {
          property: filterByProperty || undefined
        }
      });

      setConversations(data.docs);

      if (room) {
        const updatedRoom = data.docs.find((r) => r._id);
        if (updatedRoom) {
          setRoom(updatedRoom);
        }
      }
      return data.docs;
    },
    {
      refetchOnWindowFocus: false,
      initialData: []
    }
  );

  React.useEffect(() => {
    chatRooms.refetch();
  }, [filterByProperty]);

  const getMessagesForRoom = async (roomId: string) => {
    const response = await axios(userStore.auth.access_token).get(
      '/api/chat/' + roomId + '?pageSize=15&page=1'
    );
    setMessages(response.data.docs.reverse());
  };

  const handleReadMessages = async (room: IRoom) => {
    try {
      await axios(userStore.auth.access_token).put('/api/chat/read', { room_id: room._id });
      setConversations((conversations) =>
        conversations.map((c) => (c._id !== room._id ? c : { ...c, unseen_messages: 0 }))
      );
      await notificationsStore.fetchNotifications(userStore.auth.access_token);
    } catch (err) {
      console.log(err);
    }
  };

  const joinRoom = async (roomObj: IRoom) => {
    try {
      await getMessagesForRoom(roomObj._id);
      await handleReadMessages(roomObj);
      setRoom(roomObj);
      if (socket) socket.emit('join_room', roomObj._id);
    } catch (err) {
      throw err;
    }
  };

  const closeChatBox = () => {
    navigate(`/messages`);
    setRoom(null);
  };

  return (
    <>
      <div
        className={classNames('messages-page', className, {
          'no-messages': !chatRooms.isFetching && chatRooms.data?.length === 0
        })}>
        <div className='header-and-content-wrapper'>
          <HeaderLoggedIn />

          {chatRooms.isFetching && <ShowGlobalLoading />}
          <AnimatePresence>
            {!chatRooms.isFetching && chatRooms.data?.length === 0 && (
              <motion.div
                className='no-messages-view'
                {...{
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: {
                    duration: 1
                  }
                }}>
                <img src={noMessages} alt='no messages' />
                <Typography variant='body2' className='title'>
                  You don’t have any messages at the moment.
                </Typography>
                <Typography variant='body5' className='description'>
                  Once you perfectly match with someone, you can start a conversation and it will appear here.
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          {chatRooms.isFetching && <div />}
          {!chatRooms.isFetching && chatRooms.data?.length !== 0 && (
            <div className='container'>
              <div className='chats'>
                <div className='chats-header'>
                  <Typography variant='body1' className='chats-header-title'>
                    My messages
                  </Typography>
                </div>

                {/*<MessagesProperties*/}
                {/*  onPropertySelect={(propertyId) => {*/}
                {/*    setFilterByProperty(propertyId);*/}
                {/*  }}*/}
                {/*/>*/}

                <div className='conversations-list'>
                  {conversations.map((row: IRoom, rowIndex: number) => {
                    return (
                      <Conversation
                        key={rowIndex}
                        joinRoom={joinRoom}
                        room={row}
                        active={room?._id === row?._id}
                      />
                    );
                  })}
                </div>
              </div>

              {room ? (
                1 == 1 ? (
                  <ChatBox
                    username={userStore.userDetails?.username}
                    room={room}
                    user_id={userStore.userDetails?.user_id}
                    messages={messages}
                    socket={socket}
                    closeDeal={closeChatBox}
                    updateList={reorderMessages}
                  />
                ) : (
                  <div className='transaction-agreement'>
                    <Typography variant='body2' className='transaction-title'>
                      Sign the transaction agreement to view the conversation
                    </Typography>

                    <Typography className='transaction-description' variant='body4'>
                      In order to be compliant with our <a>Terms & Conditions</a> you need to sign the
                      transaction agreement. This document allows every party involved to have a transparent
                      and legal view over the entire process. Don’t worry, all your progress will remain
                      saved.
                    </Typography>

                    <Button className='go-to-transaction-button'>Go to transaction agreement</Button>
                  </div>
                )
              ) : (
                <div />
              )}
              {room?.property ? (
                <>
                  <MatchDetails room={room} fetchChatRooms={() => chatRooms.refetch()} />
                  {/*<DocumentsTest room={room} />*/}
                </>
              ) : (
                <HearthstoneAssistance room={room} />
              )}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
})`
  &.messages-page {
    z-index: 1;
    min-height: 0;
    height: 100vh;
    display: grid;
    box-sizing: border-box;
    grid-template-rows: auto min-content;
    position: relative;

    background: linear-gradient(180deg, #fffbf3 13.21%, #fff 51.66%), #fff;

    .header-and-content-wrapper {
      min-height: 100vh;
      display: grid;
      grid-template-rows: min-content auto;
      box-sizing: border-box;
    }

    .no-messages-view {
      display: grid;
      justify-items: center;
      align-content: center;
      min-height: calc(100vh - 112px);
      padding: 36px;

      img {
        max-height: 280px;
      }

      .title {
        margin-top: 24px;
      }

      .description {
        margin-top: 16px;
        max-width: 440px;
        text-align: center;
      }
    }

    .container {
      display: grid;
      grid-template-columns: 0.5fr 0.96fr 0.5fr;
      column-gap: 24px;
      overflow-y: auto;
      padding: 24px 36px 36px 36px;
      min-height: calc(100vh - 112px);
      box-sizing: border-box;
    }

    .chats {
      display: grid;
      grid-template-rows: min-content auto;
      row-gap: 24px;
      height: 100%;
      overflow-y: auto;

      .chats-header {
        display: grid;
        row-gap: 12px;

        .chats-header-title {
          color: #0d2a38;
          font-weight: 600;
          line-height: 56px;
        }
      }

      .conversations-list {
        display: grid;
        row-gap: 8px;
        height: 100%;
        overflow-y: auto;
        align-content: flex-start;
      }
    }

    .transaction-agreement {
      display: grid;
      justify-items: center;
      background-color: #e7e7e7;
      border-radius: 16px;
      align-content: center;

      .transaction-title {
        max-width: 440px;
        text-align: center;
      }

      .transaction-description {
        margin-top: 16px;
        max-width: 440px;
        text-align: center;
      }

      .go-to-transaction-button {
        margin-top: 28px;
      }
    }
  }
`;
