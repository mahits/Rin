import { useEffect, useRef, useState } from 'react'
import { getCookie } from 'typescript-cookie'
import { DefaultParams, PathPattern, Route, Switch } from 'wouter'
import Footer from './components/footer'
import { Header } from './components/header'
import { Padding } from './components/padding'
import { client } from './main'
import { CallbackPage } from './page/callback'
import { FeedPage, TOCHeader } from './page/feed'
import { FeedsPage } from './page/feeds'
import { FriendsPage } from './page/friends'
import { TimelinePage } from './page/timeline'
import { WritingPage } from './page/writing'
import { Profile, ProfileContext } from './state/profile'
import { headersWithAuth } from './utils/auth'
import { tryInt } from './utils/int'
import { Settings } from "./page/settings.tsx";
import { ClientConfigContext, ConfigWrapper } from './state/config.tsx'
 
function App() {
  const ref = useRef(false)
  const [profile, setProfile] = useState<Profile | undefined>()
  const [config, setConfig] = useState<ConfigWrapper>(new ConfigWrapper({}))
  useEffect(() => {
    if (ref.current) return
    if (getCookie('token')?.length ?? 0 > 0) {
      client.user.profile.get({
        headers: headersWithAuth()
      }).then(({ data }) => {
        if (data && typeof data != 'string') {
          setProfile({
            id: data.id,
            avatar: data.avatar || '',
            permission: data.permission,
            name: data.username
          })
        }
      })
    }
    const config = sessionStorage.getItem('config')
    if (config) {
      const configObj = JSON.parse(config)
      const configWrapper = new ConfigWrapper(configObj)
      setConfig(configWrapper)
    } else {
      client.config({ type: "client" }).get().then(({ data }) => {
        if (data && typeof data != 'string') {
          sessionStorage.setItem('config', JSON.stringify(data))
          const config = new ConfigWrapper(data)
          setConfig(config)
        }
      })
    }
    ref.current = true
    // count
    const script = document.createElement('script');
    script.defer = true;
    script.src = "https://api.obdo.cc/count/js";
    script.setAttribute("pjax", "");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [])
  return (
    <>
      <ClientConfigContext.Provider value={config}>
        <ProfileContext.Provider value={profile}>
          <Switch>
            <RouteMe path="/">
              <FeedsPage />
            </RouteMe>

            <RouteMe path="/timeline">
              <TimelinePage />
            </RouteMe>


            <RouteMe path="/friends">
              <FriendsPage />
            </RouteMe>

            <RouteMe path="/settings" paddingClassName='mx-4'>
              <Settings />
            </RouteMe>


            <RouteMe path="/writing" paddingClassName='mx-4'>
              <WritingPage />
            </RouteMe>

            <RouteMe path="/writing/:id" paddingClassName='mx-4'>
              {({ id }) => {
                const id_num = tryInt(0, id)
                return (
                  <WritingPage id={id_num} />
                )
              }}
            </RouteMe>

            <RouteMe path="/callback" >
              <CallbackPage />
            </RouteMe>

            <RouteMe path="/feed/:id" headerComponent={TOCHeader()} paddingClassName='mx-4'>
              {params => {
                return (<FeedPage id={params.id || ""} />)
              }}
            </RouteMe>

            <RouteMe path="/:alias" headerComponent={TOCHeader()} paddingClassName='mx-4'>
              {params => {
                return (
                  <FeedPage id={params.alias || ""} />
                )
              }}
            </RouteMe>

            {/* Default route in a switch */}
            <Route>404: No such page!</Route>
          </Switch>
        </ProfileContext.Provider>
      </ClientConfigContext.Provider>
    </>
  )
}

const metingJSHTML = {
  __html: `<div style="max-width: 450px; margin: auto;"><meting-js autoplay="false" order="random" theme="#409EFF" list-folded="true" fixed="true" auto="https://music.163.com/#/playlist?id=8900628861"/></div>`
};

function RouteMe({ path, children, headerComponent, paddingClassName }:
  { path: PathPattern, children: React.ReactNode | ((params: DefaultParams) => React.ReactNode), headerComponent?: React.ReactNode, paddingClassName?: string }) {
  return (
    <Route path={path} >
      {params => {
        return (<>
          <Header>
            {headerComponent}
          </Header>
          <Padding className={paddingClassName}>
            {typeof children === 'function' ? children(params) : children}
          </Padding>
          <Footer />
          <div dangerouslySetInnerHTML={metingJSHTML} />
        </>)
      }}
    </Route>
  )
}

export default App
