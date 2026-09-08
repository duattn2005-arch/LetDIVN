import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { ProjectStaticContent } from '../ProjectStaticContent';
import { CleanupEvent } from '../../types';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
  onRegisterVolunteer: (eventId: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
}) => {
  const [events, setEvents] = useState<CleanupEvent[]>([]);

  useEffect(() => {
    const refresh = () => { dbService.getEvents().then(setEvents); };
    refresh();
    const unsubscribe = dbService.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const event = events.find(e => e.id === projectId) || events.find(e => e.category === projectId) || events[0];

  if (!event) return null;

  return (
    <div className="bg-white">
      <ProjectStaticContent category={event.category} />
    </div>
  );
};
