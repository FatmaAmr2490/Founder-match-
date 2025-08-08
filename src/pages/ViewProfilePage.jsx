// src/pages/ViewProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from "@/components/ui/card";
import {
  Users,
  Facebook,
  Instagram,
  Linkedin,
  Twitter
} from "lucide-react";

export default function ViewProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/users?id=${id}`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((j) => setUser(j.user))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="max-w-md mx-auto shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-6 w-6 text-red-600" />
            {user.first_name} {user.last_name}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Bio and Idea Description */}
          {[
            { label: "Bio", value: user.bio },
            { label: "Idea Description", value: user.idea_description }
          ]
            .filter((section) => section.value)
            .map(({ label, value }) => (
              <div key={label}>
                <h3 className="font-semibold">{label}</h3>
                <p>{value}</p>
              </div>
            ))}

          {/* Skills as tags */}
          {Array.isArray(user.skills) && user.skills.length > 0 && (
            <div>
              <h3 className="font-semibold">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {Array.isArray(user.education) && user.education.length > 0 && (
            <div>
              <h3 className="font-semibold">Education</h3>
              <ul className="list-disc pl-5">
                {user.education.map((inst) => (
                  <li key={inst}>{inst}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Links with icons */}
          <div className="flex gap-4 pt-2">
            {[
              { url: user.facebook_url, icon: Facebook },
              { url: user.instagram_url, icon: Instagram },
              { url: user.linkedin_url, icon: Linkedin },
              { url: user.twitter_url, icon: Twitter }
            ]
              .filter((link) => link.url)
              .map(({ url, icon: Icon }, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
