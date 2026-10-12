'use client';
import NextLink from 'next/link';
import {AnchorHTMLAttributes} from 'react';
import {demoStorageMode} from '@/lib/demo-storage.mjs';

type Props=AnchorHTMLAttributes<HTMLAnchorElement>&{href:string};
export default function NavLink({href,children,...props}:Props){
 // Native links also work before React is ready and avoid RSC navigation
 // failures. When storage is memory-only, keep the live demo in the same page.
 if(demoStorageMode()==='memory')return <NextLink href={href} prefetch={false} {...props}>{children}</NextLink>;
 return <a href={href} {...props}>{children}</a>;
}
