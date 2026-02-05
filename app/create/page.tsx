import CreateForm from "@/components/create-form";
import Header from "@/components/header";
import { Suspense } from "react";

export default function Create () {
    return (
        <main className="min-h-screen px-2 bg-background md:px-6 py-24">
            <Header />
            
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-extrabold text-primary my-16 text-center">
                    Crie sua página Lovers
                </h1>

                <Suspense fallback={<div>Carregando formulário...</div>}>
                    <CreateForm />
                </Suspense>
            </div>
        </main>
    )
}