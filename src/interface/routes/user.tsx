import { Trans } from '@lingui/macro';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import DocumentTitle from 'interface/DocumentTitle';
import { usePageView } from 'interface/useGoogleAnalytics';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { useWaDispatch } from 'interface/utils/useWaDispatch';
import { getUser } from 'interface/selectors/user';
import { logout, linkPatreon, linkGitHub, unlinkPatreon, unlinkGitHub } from 'interface/reducers/user';
import { WarcraftLogsIcon } from 'interface/icons';
import PatreonIcon from 'interface/icons/PatreonTiny';
import GitHubMarkIcon from 'interface/icons/GitHubMarkLarge';
import PremiumIcon from 'interface/icons/Premium';
import ViralContentIcon from 'interface/icons/ViralContent';
import WebBannerIcon from 'interface/icons/WebBanner';
import DiscordIcon from 'interface/icons/DiscordTiny';
import PatreonButton from 'interface/PatreonButton';

import './user.scss';

export function Component() {
  usePageView('User');
  const user = useWaSelector((state) => getUser(state));
  const dispatch = useWaDispatch();
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState<'patreon' | 'github' | null>(null);

  // Redirect to premium page if not logged in
  if (!user) {
    return <Navigate to="/premium" replace />;
  }

  const hasPremium = user.premium;
  const hasPatreon = Boolean(user.patreon);
  const hasGitHub = Boolean(user.github);
  const patreonPremium = user.patreon?.premium;
  const githubPremium = user.github?.premium;
  const githubExpires = user.github?.expires;

  const handleLogout = (event: React.MouseEvent) => {
    event.preventDefault();
    dispatch(logout());
  };

  const handleUnlink = (provider: 'patreon' | 'github') => {
    setShowUnlinkConfirm(provider);
  };

  const confirmUnlink = () => {
    if (showUnlinkConfirm === 'patreon') {
      dispatch(unlinkPatreon());
    } else if (showUnlinkConfirm === 'github') {
      dispatch(unlinkGitHub());
    }
    setShowUnlinkConfirm(null);
  };

  const cancelUnlink = () => {
    setShowUnlinkConfirm(null);
  };

  return (
    <>
      <DocumentTitle title="User Account" />
      <div className="user-account-page container">
        <div className="row">
          <div className="col-md-12">
            <h1>
              <Trans id="interface.userPage.title">User Account</Trans>
            </h1>
          </div>
        </div>

        {/* Linked Account Section */}
        <div className="row">
          <div className="col-md-12">
            <div className="panel">
              <div className="panel-heading">
                <h2>
                  <Trans id="interface.userPage.linkedAccount">Linked Account</Trans>
                </h2>
              </div>
              <div className="panel-body">
                <div className="linked-account-info">
                  <div className="account-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <WarcraftLogsIcon style={{ fontSize: '4em', border: '0px' }} />
                    )}
                  </div>
                  <div className="account-details">
                    <div className="account-name">
                      <strong>
                        <Trans id="interface.userPage.name">NAME</Trans>
                      </strong>
                      <div>{user.name}</div>
                    </div>
                    <div className="account-provider">
                      <strong>
                        <Trans id="interface.userPage.signedInWith">SIGNED IN WITH</Trans>
                      </strong>
                      <div>Warcraft Logs</div>
                    </div>
                  </div>
                  <div className="account-actions">
                    <button onClick={handleLogout} className="btn btn-default">
                      <Trans id="interface.userPage.signOut">Sign Out</Trans>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Link Accounts Section */}
        <div className="row">
          <div className="col-md-12">
            <div className="panel">
              <div className="panel-heading">
                <h2>
                  <Trans id="interface.userPage.linkAccounts">Link Accounts</Trans>
                </h2>
              </div>
              <div className="panel-body">
                <div className="link-accounts-container">
                  {/* Patreon */}
                  <div className="link-account-item">
                    <div className="link-account-icon patreon">
                      <PatreonIcon style={{ fontSize: '3em' }} />
                    </div>
                    <div className="link-account-info">
                      <strong>Patreon</strong>
                      {hasPatreon ? (
                        <div className="text-success">
                          <Trans id="interface.userPage.linked">Linked</Trans>
                          {patreonPremium && (
                            <span>
                              {' '}
                              - <Trans id="interface.userPage.premiumActive">Premium Active</Trans>
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted">
                          <Trans id="interface.userPage.notLinked">Not linked</Trans>
                        </div>
                      )}
                    </div>
                    <div className="link-account-action">
                      {hasPatreon ? (
                        <button
                          onClick={() => handleUnlink('patreon')}
                          className="btn btn-danger"
                        >
                          <Trans id="interface.userPage.unlink">Unlink</Trans>
                        </button>
                      ) : (
                        <button onClick={linkPatreon} className="btn btn-primary patreon-btn">
                          <Trans id="interface.userPage.link">Link Patreon</Trans>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* GitHub */}
                  <div className="link-account-item">
                    <div className="link-account-icon github">
                      <GitHubMarkIcon style={{ fontSize: '3em' }} />
                    </div>
                    <div className="link-account-info">
                      <strong>GitHub</strong>
                      {hasGitHub ? (
                        <div className="text-success">
                          <Trans id="interface.userPage.linked">Linked</Trans>
                          {githubPremium && githubExpires && (
                            <span>
                              {' '}
                              -{' '}
                              <Trans id="interface.userPage.premiumUntil">
                                Premium until {new Date(githubExpires).toLocaleDateString()}
                              </Trans>
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted">
                          <Trans id="interface.userPage.notLinked">Not linked</Trans>
                        </div>
                      )}
                    </div>
                    <div className="link-account-action">
                      {hasGitHub ? (
                        <button
                          onClick={() => handleUnlink('github')}
                          className="btn btn-danger"
                        >
                          <Trans id="interface.userPage.unlink">Unlink</Trans>
                        </button>
                      ) : (
                        <button onClick={linkGitHub} className="btn btn-primary github-btn">
                          <Trans id="interface.userPage.link">Link GitHub</Trans>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {showUnlinkConfirm && (
                  <div className="unlink-confirm-modal">
                    <div className="modal-backdrop" onClick={cancelUnlink}></div>
                    <div className="modal-content">
                      <h3>
                        <Trans id="interface.userPage.confirmUnlink">Confirm Unlink</Trans>
                      </h3>
                      <p>
                        <Trans id="interface.userPage.unlinkWarning">
                          Are you sure you want to unlink your {showUnlinkConfirm} account?
                          {showUnlinkConfirm === 'patreon' && patreonPremium && (
                            <strong>
                              {' '}
                              This will remove your Premium benefits from this source.
                            </strong>
                          )}
                          {showUnlinkConfirm === 'github' && githubPremium && (
                            <strong>
                              {' '}
                              This will remove your Premium benefits from this source.
                            </strong>
                          )}
                        </Trans>
                      </p>
                      <div className="modal-actions">
                        <button onClick={cancelUnlink} className="btn btn-default">
                          <Trans id="interface.userPage.cancel">Cancel</Trans>
                        </button>
                        <button onClick={confirmUnlink} className="btn btn-danger">
                          <Trans id="interface.userPage.unlinkConfirm">Yes, Unlink</Trans>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Section */}
        <div className="row">
          <div className="col-md-12">
            <div className="panel">
              <div className="panel-heading">
                <h2>
                  <Trans id="interface.userPage.subscriptions">Subscriptions</Trans>
                </h2>
              </div>
              <div className="panel-body">
                <p className="text-muted">
                  <Trans id="interface.userPage.subscriptionsDescription">
                    The following subscriptions were detected based on your linked accounts:
                  </Trans>
                </p>
                <div className="subscriptions-list">
                  <div className="subscription-item">
                    <div className="subscription-icon">
                      <WarcraftLogsIcon style={{ fontSize: '2em', border: '0px' }} />
                    </div>
                    <div className="subscription-info">
                      <strong>Warcraft Logs</strong>
                      <div className="text-muted">
                        <Trans id="interface.userPage.wclSubscription">Base access</Trans>
                      </div>
                    </div>
                    <div className="subscription-status">
                      <span className="text-success">✓</span>
                    </div>
                  </div>

                  <div className="subscription-item">
                    <div className="subscription-icon">
                      <div className="subscription-logo">
                        <img
                          src="/img/logo.png"
                          alt="WoWAnalyzer"
                          style={{ width: '32px', height: '32px' }}
                        />
                      </div>
                    </div>
                    <div className="subscription-info">
                      <strong>WoWAnalyzer</strong>
                      <div>
                        {patreonPremium ? (
                          <span className="text-success">
                            <Trans id="interface.userPage.commonTier">Common Tier</Trans>
                          </span>
                        ) : (
                          <span className="text-muted">
                            <Trans id="interface.userPage.notSubscribed">Not Subscribed</Trans>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="subscription-status">
                      {patreonPremium ? (
                        <span className="text-success">✓</span>
                      ) : (
                        <>
                          <span className="text-muted">✗</span>
                          <PatreonButton />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="row">
          <div className="col-md-12">
            <div className="panel">
              <div className="panel-heading">
                <h2>
                  <Trans id="interface.userPage.benefits">Benefits</Trans>
                </h2>
              </div>
              <div className="panel-body">
                <p>
                  <Trans id="interface.userPage.benefitsDescription">
                    Your subscriptions grant you access to the following WoWAnalyzer features:
                  </Trans>
                </p>
                <div className="benefits-list">
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <WebBannerIcon />
                    </div>
                    <div className="benefit-info">
                      <strong>
                        <Trans id="interface.userPage.adFreeViewing">Ad-Free Viewing</Trans>
                      </strong>
                      {hasPremium ? (
                        <div className="text-success">✓</div>
                      ) : (
                        <div className="text-muted">✗</div>
                      )}
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <ViralContentIcon />
                    </div>
                    <div className="benefit-info">
                      <strong>
                        <Trans id="interface.userPage.metaBuilds">
                          Meta Builds Throughput Preview
                        </Trans>
                      </strong>
                      {hasPremium ? (
                        <div className="text-success">✓</div>
                      ) : (
                        <div className="text-muted">✗</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Component;
