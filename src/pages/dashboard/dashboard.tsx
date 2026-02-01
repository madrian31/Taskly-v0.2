import { useEffect } from 'react'
import Section from '../../components/shared/section/section'
import '../../App.css'
import { auth } from '../../firebase/firebase'
import UsersRepository from '../../../repository/UsersRepository'

export default function Dashboard() {
    useEffect(() => {
        const url = new URL(window.location.href)
        const isNewUser = url.searchParams.get('newUser') === '1'
        
        if (isNewUser && auth.currentUser) {
            // Clean URL first
            const cleanUrl = window.location.pathname + window.location.hash
            window.history.replaceState({}, '', cleanUrl)
            
            // Upsert user after reload (popup warnings are now cleared)
            const authUser = auth.currentUser

            const providerPhoto = authUser.providerData && authUser.providerData.length > 0
                ? (authUser.providerData[0] as any).photoURL
                : undefined
            const photo = authUser.photoURL ?? providerPhoto ?? undefined

            UsersRepository.upsertByUid(authUser.uid, {
                displayName: authUser.displayName ?? undefined,
                email: authUser.email ?? undefined,
                photoURL: photo,
            })
            .then(() => console.log('Upserted user after reload', authUser.uid))
            .catch(e => console.error('Failed to upsert user doc', e))
        }
    }, [])

    return (
       <Section id="dashboard">
            <h2>Welcome to Taskly</h2>
            <p>This is your dashboard where you can manage your tasks and projects efficiently.</p>
       </Section>
    )

}