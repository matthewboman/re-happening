import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Outlet,
  Routes,
  Route
} from "react-router-dom"

import About    from '../pages/about'
import Guide    from '../pages/guide'
import Navbar   from '../components/navbar'
import Infinity from '../pages/infinity'

import TestOne from '../pages/test-1'
import TestTwo from '../pages/test-2'

import "../styles/application.css"


// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootElement = document.getElementById('root')!
const root = createRoot(rootElement)

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

root.render(
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"       element={<Infinity />} />
        <Route path="/about"  element={<About />} />
        <Route path="/how-to" element={<Guide />} />
        <Route path="/test-1" element={<TestOne />} ></Route>
        <Route path="/test-2" element={<TestTwo />} ></Route>
      </Route>
    </Routes>
  </BrowserRouter>
)