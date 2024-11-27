import { Route, Router } from '@solidjs/router'
import Basic from './routes/basic'
import Static from './routes/static'
import { Suspense } from 'solid-js'

export default function App (){

    return (
        <Router root={(props)=>{
         return (<div class="flex h-screen">
            <div class="w-[250px] bg-gray-100 p-5">
                <h2>Sidebar</h2>
                <nav>
                    <ul class="list-none p-0">
                        <li><a href="/basic" class="no-underline text-gray-700">Basic</a></li>
                        <li><a href="/static" class="no-underline text-gray-700">Static</a></li>
                        
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
    </Router>
)
}