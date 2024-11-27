import Basic from './routes/Basic.tsx'

export default function App (){

    return (
    <div class="flex h-screen">
        <div class="w-[250px] bg-gray-100 p-5">
            <h2>Sidebar</h2>
            <nav>
                <ul class="list-none p-0">
                    <li><a href="#" class="no-underline text-gray-700">Basic</a></li>
                    {/* Add more navigation items here */}
                </ul>
            </nav>
        </div>
        <div class="flex-1  relative">
            <Basic />
        </div>
    </div>
)
}