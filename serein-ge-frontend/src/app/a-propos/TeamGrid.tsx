'use client';

import React from 'react';
import Image from 'next/image';
import { Mail, Phone, Linkedin } from 'lucide-react';
import { INITIAL_TEAM } from '../../lib/mock-data';
import { useSupabaseList } from '../../lib/useSupabaseData';

export default function TeamGrid() {
  const { data: team } = useSupabaseList('team', INITIAL_TEAM, { orderColumn: 'ordre' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {team.map((member) => (
        <div
          key={member.id}
          className="glass-card rounded-2xl overflow-hidden border border-slate-800 group"
        >
          <div className="relative aspect-square bg-slate-800 overflow-hidden">
            <Image
              src={member.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'}
              alt={member.nom}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          </div>

          <div className="p-5">
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              {member.nom}
            </h3>
            <div className="text-xs text-emerald-400 font-medium mt-0.5">{member.poste}</div>

            {member.bio && (
              <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                {member.bio}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              {member.email && (
                <a href={`mailto:${member.email}`} className="hover:text-emerald-400 transition" title={member.email}>
                  <Mail className="w-4 h-4" />
                </a>
              )}
              {member.telephone && (
                <a href={`tel:${member.telephone}`} className="hover:text-emerald-400 transition" title={member.telephone}>
                  <Phone className="w-4 h-4" />
                </a>
              )}
              {member.linkedin_url && (
                <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
