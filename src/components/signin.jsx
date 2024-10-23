import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import Image from "next/image";
import LoginWithSocial from "./loginWithSocial";
import { Divider } from "primereact/divider";


export default function Signin() {
    const [email, setEmail] = useState("");
    return (
        <>         
        <div className="flex align-items-center justify-content-end img-background p-4">
            <div className="surface-card p-4 shadow-2 border-round w-full lg:w-4">
                <div className="text-center mb-5">
                <Image
                    aria-hidden
                    src="/logo.svg"
                    alt="Raftaar logo. "
                    width={100}
                    height={100}
                    className="mb-3"
                    />
                    <div className="text-900 text-3xl font-medium mb-3">Raftaar Logistics</div>
                </div>

                <div>
                    <label htmlFor="email"  className="block text-900 font-medium mb-2">Email Address</label>
                    <InputText id="email" className="w-full mb-3" placeholder="Enter your email address" value={email} onChange={(e) => setUsername(e.target.value)} />

                    <label htmlFor="password" className="block text-900 font-medium mb-2">Password</label>
                    <InputText id="password" type="password" placeholder="Password" className="w-full mb-3" />

                    <div className="flex align-items-center justify-content-between mb-6">
                        <a className="font-medium underline ml-2 text-red-700 text-right cursor-pointer">Forgot your password?</a>
                    </div>

                    <Button label="Sign In" icon="pi pi-user" className="w-full" />
                    <Divider />
                    <LoginWithSocial />
                </div>
            </div>
        </div>   
        </>
    );
}