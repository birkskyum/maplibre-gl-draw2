import { A, Route, Router } from '@solidjs/router'
import Basic from './routes/basic'
import Static from './routes/static'
import { Suspense } from 'solid-js'
import ReinitControl from './routes/reinit-control'
import CustomUI from './routes/custom-ui'
import DrawRectangle from './routes/draw-rectangle'
import DrawAssistedRectangle from './routes/draw-assisted-rectangle'
import Circle from './routes/circle'
import RotateScaleRectangle from './routes/scale-rotate'
import Planar from './routes/planar'

import './app.css';

export default function App (){

    return (
        <Router root={(props)=>{
         return (<div class="flex h-screen">
            <div class="w-[50px] bg-gray-700 p-5">
                {/* <h2>Pages</h2> */}
                <nav>

                </nav>
            </div>
            <div class="flex-1  relative">
                <Suspense>
                    {props.children}
                </Suspense>
            </div>
        </div>)
        }}>

            <Route path={'/planar'} component={Planar} />
            <Route path={'/planar/basic'} component={Basic} />
            <Route path={'/planar/static'} component={Static} />
            <Route path={'/planar/reinit-control'} component={ReinitControl} />
            <Route path={'/planar/custom-ui'} component={CustomUI} />
            <Route path={'/planar/draw-rectangle'} component={DrawRectangle} />
            <Route path={'/planar/draw-assisted-rectangle'} component={DrawAssistedRectangle} />
            <Route path={'/planar/circle'} component={Circle} />
            <Route path={'/planar/scale-rotate'} component={RotateScaleRectangle} />
    </Router>
)
}