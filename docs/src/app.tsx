import { A, Route, Router } from '@solidjs/router'
import Basic from './routes/basic'
import Static from './routes/static'
import { Suspense } from 'solid-js'
import ReinitControl from './routes/reinit-control'
import CustomUI from './routes/custom-ui'
import DrawRectangle from './routes/draw-rectangle'

import './app.css';

export default function App (){

    return (
        <Router root={(props)=>{
         return (<div class="flex h-screen">
            <div class="w-[250px] bg-gray-100 p-5">
                {/* <h2>Pages</h2> */}
                <nav>
                    <ul class="list-none p-0">
                        <li><A href="/basic" class="no-underline text-gray-700">Basic</A></li>
                        <li><A href="/reinit-control" class="no-underline text-gray-700">Reinitialize control</A></li>
                        <li><A href="/custom-ui" class="no-underline text-gray-700">Custom UI</A></li>
                        <li><A href="/static" class="no-underline text-gray-700">Static Mode</A></li>
                        <li><A href="/draw-rectangle" class="no-underline text-gray-700">Draw Rectangle</A></li>
                        
                    </ul>
                </nav>
            </div>
            <div class="flex-1  relative">
                <Suspense>
                    {props.children}
                    
                </Suspense>
            </div>
        </div>)
        }}>
            <Route path={'/basic'} component={Basic} />
            <Route path={'/static'} component={Static} />
            <Route path={'/reinit-control'} component={ReinitControl} />
            <Route path={'/custom-ui'} component={CustomUI} />
            <Route path={'/draw-rectangle'} component={DrawRectangle} />
    </Router>
)
}