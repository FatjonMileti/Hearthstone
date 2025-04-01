import { styled } from '@mui/system';
import { HTMLAttributes } from 'react';
import { Typography } from '../../../components/index';
import { Button } from '../../../components/index';
import { InfoCard } from './components/InfoCard';
import { Icon, Label } from '../../../components/index';
import visa from './Visa.svg';

export const PlanAndPayment = styled(({ className }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`plan-and-payment ${className}`}>
      <div className='plan-and-payment-header'>
        <Typography variant='body2' className='section-title'>
          Plan and payment
        </Typography>
        <Button type='submit' size='medium' className='submit-button'>
          Save changes
        </Button>
      </div>
      <div className='section-wrapper'>
        <div className='plan-and-payment-wrapper'>
          <div className='current-plan'>
            <Typography variant='body3' className='title'>
              Current plan
            </Typography>
            <div className='plan-content'>
              <div className='change-plan'>
                <div className='Hearthstone-price'>
                  <div>
                    <Typography variant='body3' className='Hearthstone-rookie'>
                      Hearthstone Rookie
                    </Typography>
                    <Typography variant='body6' className='description'>
                      Billed each month at the then-current monthly price until cancelled.
                    </Typography>
                  </div>
                  <div className='small-line'></div>
                  <div className='price-wrapper'>
                    <Typography variant='body3' className='price'>
                      £10,99
                    </Typography>
                    <Typography variant='body6' className='per-month'>
                      per month
                    </Typography>
                  </div>
                </div>
                <Label size='small' className='change-plan-button'>
                  Change plan
                </Label>
              </div>
              <div className='info-wrapper'>
                <Icon icon='info' size={16} />
                <Typography variant='body6' className='info'>
                  Next payment of £10,99 (applicable taxes included) is due on{' '}
                  <span className='date'> 4 Jul 2024 </span>
                </Typography>
              </div>
            </div>
          </div>
          <div className='payment-method'>
            <Typography variant='body3' className='title'>
              Payment method
            </Typography>
            <div className='context'>
              <div className='credit-card-wrapper'>
                <div className='credit-card'>
                  <img src={visa} alt='visa' />
                  <div>
                    <Typography variant='body4' className='credit-card-info'>
                      Card ending in 7380
                    </Typography>
                    <Typography variant='body5' className='expiry-date'>
                      Expiry date: 04/27
                    </Typography>
                  </div>
                </div>
                <Label variant='secondary' size='small' className='update-card'>
                  Update card
                </Label>
              </div>
              <Typography variant='body6' className='description'>
                Hearthstone holds no information about your debit card. Payment is done via a payment processor
                who uses a valid transaction token. You can remove that token at any time from your bank app
                or by calling your bank customer support.
              </Typography>
            </div>
          </div>
        </div>
        <div className='right-part'>
          <InfoCard
            icon='task'
            title='How is my subscription setup?'
            description='As soon as you enrol into a subscription plan and enter a valid debit card you will get charged based on your plan on the same day of each month until cancellation. '
          />
          <InfoCard
            icon='withdraw'
            title='What happens if I don’t get any matches?'
            description='If you don’t find a perfect match within 30 days of your subscription it will automatically get cancelled. We will however offer incentives on how to adapt your search to find perfect matches.'
          />
        </div>
      </div>
    </div>
  );
})`
  &.plan-and-payment {
    display: grid;
    gap: 40px;

    .plan-and-payment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .section-title {
        color: #0d2a38;
        font-weight: 600;
        line-height: 48px;
      }

      .submit-button {
        padding: 12px 24px;
      }
    }

    .section-wrapper {
      position: relative;
      display: grid;
      grid-template-columns: 1.7fr 1fr;
      justify-content: space-between;
      column-gap: 32px;

      .plan-and-payment-wrapper {
        display: grid;
        grid-template-rows: min-content min-content;
        row-gap: 24px;
        max-width: 556px;

        .title {
          color: #0d2a38;
          font-weight: 600;
        }

        .current-plan {
          display: grid;
          grid-template-rows: min-content min-content min-content;
          gap: 16px;

          .plan-content {
            display: grid;
            border-radius: 8px;
            box-shadow: 0 4px 32px 0 rgba(13, 42, 56, 0.1);
            overflow: hidden;

            .change-plan {
              display: grid;
              gap: 16px;
              padding: 24px;
              background: linear-gradient(180deg, #0d2a38 0%, #184d6d 100%);

              .Hearthstone-price {
                display: flex;
                gap: 24px;
                justify-content: space-between;

                .Hearthstone-rookie {
                  color: #fff;
                  font-weight: 900;
                }

                .description {
                  color: #fff;
                  font-weight: 500;
                  line-height: 20px;
                }

                .small-line {
                  width: 1px;
                  background-color: #184d6d;
                }

                .price-wrapper {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;

                  .price {
                    color: #fff;
                    font-weight: 900;
                  }

                  .per-month {
                    color: #fff;
                    font-weight: 500;
                    line-height: 20px;
                  }
                }
              }

              .change-plan-button {
                padding: 8px 16px;
                border: 1px solid #fff;
              }
            }

            .info-wrapper {
              display: flex;
              padding: 8px 24px;
              align-items: center;
              gap: 4px;
              background-color: #c0daff;

              .info {
                color: #0d2a38;
                font-weight: 500;
                line-height: 20px;

                .date {
                  font-weight: 700;
                }
              }
            }
          }
        }

        .payment-method {
          display: grid;
          gap: 16px;

          .context {
            display: grid;
            gap: 8px;

            .credit-card-wrapper {
              display: grid;
              //grid-template-columns: min-content min-content;
              //justify-content: space-between;
              padding: 24px;
              border-radius: 8px;
              background-color: #f3f4f5;
                gap: 16px;

              .credit-card {
                display: flex;
                align-items: center;
                gap: 16px;

                .credit-card-info {
                  width: max-content;
                  font-weight: 700;
                  color: #0d2a38;
                }

                .expiry-date {
                  color: #646464;
                  font-weight: 500;
                  line-height: 24px;
                }
              }

              .update-card {
                border: 1px solid #184d6d;
              }
            }

            .description {
              color: #646464;
              font-weight: 500;
              line-height: 20px;
            }
          }
        }
      }

      .right-part {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }
    }
  }
`;
