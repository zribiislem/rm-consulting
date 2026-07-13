import { motion } from 'motion/react';
import { Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { teamData } from '../data';

export default function Team() {
  return (
    <section id="team" className="py-20 sm:py-28 bg-white scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Team Header */}
        <div className="mb-16">
          <span className="text-secondary font-display font-bold tracking-widest text-xs uppercase block mb-3">
            Notre Capital Humain
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-4">
            Notre Équipe de Direction
          </h2>
          <div className="w-16 h-1 bg-secondary mx-auto rounded-full mb-6" />
          <p className="font-sans text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Des experts passionnés, combinant rigueur analytique et vision pragmatique pour guider vos décisions financières majeures.
          </p>
        </div>

        {/* 6 Grid of Team Members */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {teamData.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group text-center"
            >
              {/* Member Photo Frame */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-md border border-gray-100 bg-gray-50">
                <img
                  src={member.imageUrl}
                  alt={`${member.name} - ${member.role}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Hover Slide Up Bio & Social Overlay */}
                <div className="absolute inset-0 bg-primary/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white text-left">
                  <p className="font-sans text-[11px] leading-relaxed mb-4 line-clamp-4 font-light opacity-90">
                    {member.bio}
                  </p>
                  
                  {/* Social Icons row */}
                  <div className="flex items-center gap-2 border-t border-white/20 pt-3">
                    <a
                      href="#"
                      className="w-7 h-7 rounded-full bg-white/20 hover:bg-white flex items-center justify-center text-white hover:text-primary transition-all"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`mailto:contact@rm-consulting.tn?subject=Demande%20expert%20${member.name}`}
                      className="w-7 h-7 rounded-full bg-white/20 hover:bg-white flex items-center justify-center text-white hover:text-primary transition-all"
                      title="Email Direct"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-[10px] text-white/70 font-sans font-medium ml-auto uppercase tracking-wider flex items-center gap-0.5">
                      Bio <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Name & Role */}
              <h4 className="font-display font-extrabold text-gray-900 text-base mb-1 group-hover:text-primary transition-colors">
                {member.name}
              </h4>
              <p className="text-[10px] sm:text-xs text-on-surface-variant font-sans font-bold uppercase tracking-wider">
                {member.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
