import { ReactElement, cloneElement, useState } from 'react';
import { useAuthStore } from '../stores/authStore.ts';
import { AuthGuardModal } from './AuthGuardModal.tsx';

interface RequireAuthActionProps {
  children: ReactElement;
  onAction: () => void;
}

export function RequireAuthAction({ children, onAction }: RequireAuthActionProps) {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      onAction();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {cloneElement(children, { onClick: handleClick })}
      {showModal && (
        <AuthGuardModal 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            onAction();
          }} 
        />
      )}
    </>
  );
}
