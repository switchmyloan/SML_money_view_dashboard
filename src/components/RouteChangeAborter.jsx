import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { cancelPendingRequests } from '../api-services/api'

const RouteChangeAborter = () => {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)

  useEffect(() => {
    if (previousPath.current !== pathname) {
      cancelPendingRequests(`navigated from ${previousPath.current} to ${pathname}`)
      previousPath.current = pathname
    }
  }, [pathname])

  return null
}

export default RouteChangeAborter
