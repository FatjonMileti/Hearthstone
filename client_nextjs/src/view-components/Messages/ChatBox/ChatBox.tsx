import { styled } from '@mui/system';
import { TextField } from '../../../components/TextField';
import { Button } from '../../../components/Button';
import React, { HTMLAttributes, MouseEventHandler, useEffect, useState } from 'react';
import { Typography } from '../../../components/Typography';
import { IMessageBody, IMessageItem, IRoom } from '../messages.interface';
import { Socket } from 'socket.io-client';
import { Avatar } from '../../../components/Avatar';
import { getAvatarFormIndex } from '../../HomeLoggedIn/avatars';
import classNames from 'classnames';
import { SuggestedMessages } from './SuggestedMessages';
import { Icon, IconButton, Label } from '../../../components';
import { useNavigate } from '../../../compat/router';

export interface ChatBoxProps extends HTMLAttributes<HTMLDivElement> {
  username: string;
  room: IRoom;
  user_id: string;
  messages: IMessageItem[];
  socket: Socket | null;
  closeDeal?: MouseEventHandler;
  updateList?: (data: any) => void;
}

export const ChatBox = styled(({ className, updateList, room, user_id, messages, socket }: ChatBoxProps) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState<IMessageItem[]>([]);
  const navigate = useNavigate();

  const isAuthor = room.author._id === user_id;

  const conversationBoxRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessageList(
      messages.filter((item: any) => item.hasOwnProperty('author') && item.hasOwnProperty('participant'))
    );
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (data: any) => {
        setMessageList((list: IMessageItem[]) => [...list, data]);
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket]);

  React.useEffect(() => {
    if (conversationBoxRef.current) {
      conversationBoxRef.current;
      conversationBoxRef.current.scrollTop = conversationBoxRef.current.scrollHeight;
    }
  }, [messageList]);

  const avatarKeyById = {
    [room.author._id]: room.author.avatar,
    [room.participant._id]: room.participant.avatar
  };

  const sendMessage = async () => {
    if (!currentMessage) {
      return;
    }

    await _sendMessage({ message: currentMessage });

    setCurrentMessage('');
  };

  const _sendMessage = async ({ message }: { message: string }) => {
    const messageBody: IMessageBody = {
      room_id: room._id,
      message,
      sender: user_id
    };

    const messageItem: IMessageItem = {
      ...messageBody,
      participant: !isAuthor ? user_id : room.participant._id,
      author: isAuthor ? room.author : room.participant,
      time: new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes(),
      sender: isAuthor ? room.author : room.participant
    };

    if (!room.hasOwnProperty('last_message')) {
      room.last_message = {
        message: ''
      };
    }

    if (socket) await socket.emit('send_message', messageBody);

    messageItem.isCurrentUser = true;

    setMessageList((prevMessages: IMessageItem[]) => [...prevMessages, messageItem]);

    room.last_message = {
      message: currentMessage
    };

    room.unseen_messages = 0;
    updateList && updateList(room);
  };

  return (
    <div className={`chat-box ${className}`}>
      <div className='conversation'>
        <div className='messages-list' ref={conversationBoxRef}>
          {messageList.map((messageContent: IMessageItem, messageIndex: number) => {
            const authorId = messageContent?.sender?._id;

            const fromMe = authorId === user_id;

            const isLastMessageFromAuthor =
              messageList.findLastIndex((m: any) => m.sender._id === authorId) === messageIndex;

            const isFirstInGroup =
              !messageList[messageIndex - 1] || messageList[messageIndex - 1]?.sender?._id !== authorId;

            const inMiddleOfGroup =
              messageList[messageIndex - 1]?.sender?._id === authorId &&
              messageList[messageIndex + 1]?.sender?._id === authorId;

            const lastInGroup =
              messageList[messageIndex - 1]?.sender?._id === authorId &&
              (!messageList[messageIndex + 1] || messageList[messageIndex + 1]?.sender?._id !== authorId);

            const avatarKey = avatarKeyById[authorId];
            const avatar = getAvatarFormIndex(avatarKey);

            return (
              <div
                className={classNames('message', {
                  'from-me': fromMe,
                  'from-you': !fromMe,
                  last: isLastMessageFromAuthor,
                  'first-in-group': isFirstInGroup,
                  'in-middle-of-group': inMiddleOfGroup,
                  'last-in-group': lastInGroup
                })}
                key={messageIndex}>
                <Avatar
                  image={avatar}
                  className={classNames({
                    Hearthstone: avatarKey === 'Hearthstone'
                  })}
                />

                {messageList.length === 1 && avatarKey === 'Hearthstone' ? (
                  <div className='Hearthstone-message'>
                    <div className='Hearthstone-message-content'>
                      <Typography variant='body4' className='Hearthstone-text'>
                        Hey {room.participant.first_name}, welcome to Hearthstone!
                      </Typography>
                      <Typography variant='body4' className='Hearthstone-text'>
                        We’re happy you choose to find a perfect match and not waste time with unnecessary
                        listings. To get started you have to initiate a match finding. We recommend that you
                        fill out all details in order to make the algorithm learn from your choices and show
                        you curated listings based on your needs.
                      </Typography>
                      <Typography variant='body4' className='Hearthstone-text'>
                        Any questions you have you can write them in this chat and our AI will answer you
                        instantly.
                      </Typography>
                      <Typography variant='body4' className='Hearthstone-text'>
                        Are you ready to start your journey with Hearthstone?
                      </Typography>
                    </div>
                    <Label variant='special' onClick={() => navigate('/matches')}>
                      Start matching
                    </Label>
                  </div>
                ) : (
                  <Typography variant='body5' className='text'>
                    {messageContent.message}
                  </Typography>
                )}
              </div>
            );
          })}
          {messageList.length === 0 && (
            <Typography variant='body5' className='chat-info'>
              Amazing news {room.author.first_name} and {room.participant.first_name}! You are now matched
              with each other. <br /> Use the chat below to communicate or the panel on the right to start
              sealing the deal.
            </Typography>
          )}
        </div>

        {/*<SuggestedMessages room={room} sendMessage={_sendMessage} lastMessage={messageList.slice(-1)?.[0]} />*/}
      </div>
      <div className='write-box'>
        <TextField
          autoComplete='off'
          placeholder='Write your message'
          endAdornment={
            <IconButton size='large' noBackground style={{ border: '1px solid  #184D6D' }}>
              <Icon icon='attach' color='#184D6D' size={24} />
            </IconButton>
          }
          value={currentMessage}
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === 'Enter' && sendMessage();
          }}
        />
        <Button className='send-button' size='large' onClick={sendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
})`
  &.chat-box {
    filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.1));
    border-radius: 12px;
    display: grid;
    grid-template-rows: auto 88px;
    overflow-y: auto;

    .conversation {
      display: grid;
      grid-template-rows: auto min-content;
      overflow-y: auto;
      .messages-list {
        overflow-y: auto;
        display: grid;
        grid-template-rows: 1fr;
        grid-auto-rows: max-content;
        align-items: flex-end;

        gap: 16px;
        padding: 24px;

        background: #ffffff;

        box-sizing: border-box;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          //box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        }

        &::-webkit-scrollbar-thumb {
          background-color: darkgrey;
          outline: 1px solid slategrey;
        }

        .message {
          max-width: 80%;
          height: min-content;

          display: grid;
          grid-template-columns: min-content auto;
          column-gap: 4px;

          .avatar {
            align-self: flex-end;
            height: 24px;
            width: 24px;
            align-items: center;
            justify-content: center;
            text-transform: uppercase;
            font-weight: 600;
            visibility: hidden;

            &.Hearthstone {
              background-size: 12px 12px;
              background-color: #e5155a;
            }
          }

          .Hearthstone-message {
            display: grid;
            gap: 16px;
            padding: 16px;
            width: 100%;
            height: 360px;
            background-color: #f3f4f5;
            color: rgba(13, 42, 56, 1);
            border-radius: 16px 16px 16px 16px;

            .Hearthstone-message-content {
              display: grid;
              gap: 16px;
              align-content: flex-start;
              padding: 16px;

              .Hearthstone-text {
                color: rgba(13, 42, 56, 1);
                font-weight: 500;
                font-size: 14px;
              }
            }
          }

          .text {
            color: #0d2a38;
            background-color: #f3f4f5;
            font-weight: 500;
            line-height: 24px;
            padding: 16px;
            border-radius: 16px 16px 16px 0px;
          }

          &.from-you {
            grid-template-columns: min-content auto;
          }

          &.from-you {
            justify-self: flex-start;

            .text {
              background-color: #f3f4f5;
              color: #0d2a38;
              border-radius: 16px 16px 16px 16px;
            }

            &.first-in-group {
              .text {
                border-bottom-left-radius: 0;
              }
            }

            &.in-middle-of-group {
              margin-top: -12px;
              .text {
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
              }
            }

            &.last-in-group {
              margin-top: -12px;
              .text {
                border-bottom-left-radius: 16px;
              }
            }

            & + .from-me {
              .text {
                border-top-left-radius: 0;
              }
            }
          }

          &.from-me {
            grid-template-columns: auto min-content;
            .avatar {
              order: 2;
            }
          }

          &.from-me {
            justify-self: flex-end;

            .text {
              background-color: #c0daff;

              color: white;
              border-radius: 16px 16px 16px 16px;
            }

            &.first-in-group {
              .text {
                border-bottom-right-radius: 0;
              }
            }

            &.in-middle-of-group {
              margin-top: -12px;
              .text {
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
              }
            }

            &.last-in-group {
              margin-top: -12px;
              .text {
                border-top-right-radius: 0;
              }
            }

            & + .from-you {
              .text {
                border-top-right-radius: 0;
              }
            }
          }

          &.last {
            .avatar {
              visibility: visible;
            }
          }
        }

        .chat-info {
          color: #a7a7a7;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
        }
      }
    }

    .write-box {
      height: 88px;

      background: white;
      box-shadow: 0px 4px 48px 0px rgba(0, 0, 0, 0.04);

      display: grid;
      grid-template-columns: auto min-content;
      align-items: center;
      padding: 16px;
      gap: 16px;
      box-sizing: border-box;
      border-top: 1px solid #e7e7e7;

      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;

      .text-field {
        border-radius: 8px;
        .input-wrapper {
          border: none;
          background-color: white;
        }
      }

      .send-button {
      }
    }
  }
`;
