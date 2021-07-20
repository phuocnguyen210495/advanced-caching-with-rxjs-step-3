import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { merge } from 'rxjs/observable/merge';
import { take, mergeMap, skip, mapTo } from 'rxjs/operators';

import { Memoize } from 'lodash-decorators';

import { JokeService, Joke } from '../joke.service';

@Component({
  selector: 'app-joke-list',
  templateUrl: './joke-list.component.html',
  styleUrls: ['./joke-list.component.scss']
})
export class JokeListComponent implements OnInit {
  jokes$: Observable<Array<Joke>>;
  showNotification$: Observable<boolean>;
  update$ = new Subject<void>();

  constructor(private jokeService: JokeService) { }

  ngOnInit() {
    const initialJokes$ = this.getDataOnce();

    const updates$ = this.update$.pipe(
      mergeMap(() => this.getDataOnce())
    );

    this.jokes$ = merge(initialJokes$, updates$);

    const initialNotifications$ = this.jokeService.jokes.pipe(skip(1));
    const show$ = initialNotifications$.pipe(mapTo(true));
    const hide$ = this.update$.pipe(mapTo(false));
    this.showNotification$ = merge(show$, hide$);
  }

  getDataOnce() {
    return this.jokeService.jokes.pipe(take(1));
  }

  @Memoize()
  getVotes(id: number) {
    return Math.floor(10 + Math.random() * (100 - 10));
  }
}