import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';
import { Label } from '../../../components';
import { useProfileStore } from '../../../globalState/profile';

import { Role } from '../../../enums';
import { IMessageItem, IRoom } from '../messages.interface';

type Question = {
  [key: string]: string[];
};

const questions: Question = {
  ['Do you have any pets?']: ['Yes', 'No'],
  ['Do you have any children?']: ['Yes, i do have children', 'No, i dont have children'],
  ['Do you know the move in date?']: ['Yes, I know', 'No, I dont know']
};

const useSuggestions = ({ room }: { room: IRoom }) => {
  const questionsArray = Object.keys(questions);

  const uniquesQuestionKey = ({ question }: { question: string }) => `${question}/${room._id}`;

  const askedQuestions: { [key: string]: boolean } = JSON.parse(
    localStorage.getItem('askedQuestions') || '{}'
  );

  const notAsked = (question: string) => !askedQuestions[uniquesQuestionKey({ question })];

  const notAskedQuestions = questionsArray.filter(notAsked);

  const markQuestionAsAsked = (question: string) => {
    askedQuestions[uniquesQuestionKey({ question })] = true;
    localStorage.setItem('askedQuestions', JSON.stringify(askedQuestions));
  };

  return {
    questionsArray,
    notAskedQuestions,
    markQuestionAsAsked,
    uniquesQuestionKey
  };
};

interface SuggestedMessagesProps extends HTMLAttributes<HTMLDivElement> {
  sendMessage: ({ message }: { message: string }) => void;
  lastMessage?: IMessageItem;
  room: IRoom;
}
export const SuggestedMessages = styled(
  ({ className, sendMessage, lastMessage, room }: SuggestedMessagesProps) => {
    const profileStore = useProfileStore();

    return (
      <>
        {room.property && (
          <div className={classNames(className, 'suggested-messages')}>
            <AnimatePresence>
              {{
                [Role.Tenant]: <SuggestedAnswers lastMessage={lastMessage} sendMessage={sendMessage} />,
                [Role.Landlord]: (
                  <SuggestedQuestions lastMessage={lastMessage} sendMessage={sendMessage} room={room} />
                )
              }[profileStore.role] || null}
            </AnimatePresence>
          </div>
        )}
      </>
    );
  }
)`
  &.suggested-messages {
    width: 100%;
    background-color: white;

    .questions {
      justify-content: center;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding: 32px;
      box-sizing: border-box;
    }
  }
`;

interface SuggestedQuestionsProps extends HTMLAttributes<HTMLDivElement> {
  sendMessage: ({ message }: { message: string }) => void;
  lastMessage?: IMessageItem;
  room: IRoom;
}
const SuggestedQuestions = styled(
  ({ className, lastMessage, sendMessage, room }: SuggestedQuestionsProps) => {
    const suggestions = useSuggestions({ room });

    const askSuggestedQuestion = (question: string) => {
      sendMessage({ message: question });
      suggestions.markQuestionAsAsked(question);
    };

    if (suggestions.notAskedQuestions.length === 0) return null;

    return (
      <>
        {!suggestions.questionsArray.includes(lastMessage?.message || '') && (
          <motion.div
            key='suggestedQuestions'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={classNames(className, 'questions')}>
            {suggestions.notAskedQuestions.map((question, questionIndex) => {
              return (
                <Label variant='secondary' key={questionIndex} onClick={() => askSuggestedQuestion(question)}>
                  {question}
                </Label>
              );
            })}
          </motion.div>
        )}
      </>
    );
  }
)`
  &.questions {
  }
`;

interface SuggestedAnswersProps extends HTMLAttributes<HTMLDivElement> {
  sendMessage: ({ message }: { message: string }) => void;
  lastMessage?: IMessageItem;
}
const SuggestedAnswers = styled(({ className, lastMessage, sendMessage }: SuggestedAnswersProps) => {
  let suggestedAnswers = questions[lastMessage?.message || ''];

  return (
    <>
      {suggestedAnswers && suggestedAnswers?.length > 0 && (
        <motion.div
          key='suggestedAnswers'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className={classNames(className, 'questions')}>
          {suggestedAnswers?.map((suggestedAnswers) => (
            <Label variant='secondary' onClick={() => sendMessage({ message: suggestedAnswers })}>
              {suggestedAnswers}
            </Label>
          ))}
        </motion.div>
      )}
    </>
  );
})`
  &.questions {
  }
`;
