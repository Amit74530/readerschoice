import React from 'react'
import Banner from './Banner'
import TopInterested from './TopInterested'
import Recommened from './Recommened'

import StoreInterior from '../../components/StoreInterior'
import Testimonials from '../../components/Testimonials'

const Home = () => {
  return (
    <>
        <Banner/>
        <TopInterested/>
        <Recommened/>
        <StoreInterior/>
        <Testimonials/>
    </>
  )
}

export default Home