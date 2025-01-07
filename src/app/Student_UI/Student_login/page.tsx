"use client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {useRouter} from "next/navigation"

export default function Home() {

  const router=useRouter();

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-950">
      <main className="flex flex-1 justify-center px-40 py-5">
        <div className="w-full flex-1 flex-col py-5">
          <div className=" rounded-xl bg-cover bg-center bg-no-repeat p-8"
            style={{
              backgroundImage: `url("https://cdn.usegalileo.ai/sdxl10/6b462333-622b-4954-a109-51445dde8827.png")`
            }}>
            <div className="flex flex-col gap-6 items-center justify-center ">
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl  p-2 rounded-[1vh]" style={{background:`url("https://cdn.pixabay.com/photo/2015/06/20/07/24/color-815550_960_720.png")`}}>
                  Welcome to Sankan Academy
                </h1>
              </div>

              <div 
                className="bg-[#0A0A0B] rounded-lg opacity-85 text-white p-4  w-[35%] lg:rounded-[3vh] rounded-0 mt-[0vh] py-13"
              >
                {/* Create Account Section */}
                <div className="space-y-6 bg-[#111113] rounded-lg p-6 mb-4 ">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Login into account</h2>
                    <p className="text-gray-400">Enter your email below to create your account</p>
                  </div>

                  {/* {error && (
                    <div className="text-red-500 text-sm mb-4">
                      {error}
                    </div>
                  )} */}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none" htmlFor="email">
                        Email
                      </label>
                      <Input
                        id="email"
                        placeholder="m@example.com"
                        type="email"
                        // value={email}
                        // onChange={(e) => setEmail(e.target.value)}
                        className="bg-[#1C1C1E] border-none text-white placeholder:text-gray-400 border border-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none" htmlFor="password">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        // value={password}
                        // onChange={(e) => setPassword(e.target.value)}
                        className="bg-[#1C1C1E] border-none text-white"
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={()=>{router.push('/Student_UI/Student_Flow/BackStory')}}
                    // onClick={handleEmailSignIn}
                  >
                    Login into account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}